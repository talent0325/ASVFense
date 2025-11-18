#!/usr/bin/env python
# -*- encoding: utf-8 -*-


import json
import logging
from pathlib import Path
import os
import time
import wandb

import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader
import torchaudio.transforms

from src.ddp import distrib
from src.data.datasets import PrHrSet, match_signal
from src.enhance import enhance, save_wavs, save_specs
from src.evaluate import evaluate, evaluate_on_saved_data
from src.model_serializer import SERIALIZE_KEY_BEST_STATES, SERIALIZE_KEY_MODELS, SERIALIZE_KEY_OPTIMIZERS,  \
    SERIALIZE_KEY_STATE, SERIALIZE_KEY_HISTORY, serialize
from src.models.discriminators import discriminator_loss, feature_loss, generator_loss
from src.models.stft_loss import MultiResolutionSTFTLoss
from src.utils import bold, copy_state, pull_metric, swap_state, LogProgress
from src.wandb_logger import create_wandb_table
from src.models.spec import spectro

logger = logging.getLogger(__name__)


GENERATOR_KEY = 'generator'

METRICS_KEY_EVALUATION_LOSS = 'evaluation_loss'
METRICS_KEY_BEST_LOSS = 'best_loss'

METRICS_KEY_LSD = 'Average lsd'
METRICS_KEY_VISQOL = 'Average visqol'


class Solver(object):
    def __init__(self, data, models, optimizers, args):
        # train, val, test
        self.tr_loader = data['tr_loader']
        self.cv_loader = data['cv_loader']
        self.tt_loader = data['tt_loader']
        self.args = args

        self.adversarial_mode = 'adversarial' in args.experiment and args.experiment.adversarial

        self.models = models
        self.dmodels = {k: distrib.wrap(model) for k, model in models.items()}
        self.model = self.models['generator']
        self.dmodel = self.dmodels['generator']


        self.optimizers = optimizers
        self.optimizer = optimizers['optimizer']
        if self.adversarial_mode:
            self.disc_optimizers = {'disc_optimizer': optimizers['disc_optimizer']}


        # Training config
        self.device = args.device
        self.epochs = args.epochs

        # Checkpoints
        self.continue_from = args.continue_from
        self.eval_every = args.eval_every
        self.cross_valid = args.cross_valid     # main_config.yaml, cross_valid: False
        self.cross_valid_every = args.cross_valid_every
        self.checkpoint = args.checkpoint
        if self.checkpoint:
            self.checkpoint_file = Path(args.checkpoint_file)
            self.best_file = Path(args.best_file)
            logger.debug("Checkpoint will be saved to %s", self.checkpoint_file.resolve())
        self.history_file = args.history_file

        self.best_states = None
        self.restart = args.restart
        self.history = []  # Keep track of loss
        self.samples_dir = args.samples_dir  # Where to save samples

        self.num_prints = args.num_prints  # Number of times to log per epoch


        self._reset()

    def _copy_models_states(self):
        states = {}
        for name, model in self.models.items():
            states[name] = copy_state(model.state_dict())
        return states

    def _load(self, package, load_best=False):
        if load_best:
            for name, model_package in package[SERIALIZE_KEY_BEST_STATES][SERIALIZE_KEY_MODELS].items():
                self.models[name].load_state_dict(model_package[SERIALIZE_KEY_STATE])
        else:
            for name, model_package in package[SERIALIZE_KEY_MODELS].items():
                self.models[name].load_state_dict(model_package[SERIALIZE_KEY_STATE])
            for name, opt_package in package[SERIALIZE_KEY_OPTIMIZERS].items():
                self.optimizers[name].load_state_dict(opt_package)


    def _reset(self):
        """_reset."""
        load_from = None
        load_best = False
        keep_history = True
        # Reset
        if self.checkpoint and self.checkpoint_file.exists() and not self.restart:
            load_from = self.checkpoint_file
        elif self.continue_from:
            load_from = self.continue_from
            load_best = self.args.continue_best
            keep_history = self.args.keep_history

        if load_from:
            logger.info(f'Loading checkpoint model: {load_from}')
            package = torch.load(load_from, 'cpu')
            self._load(package, load_best)
            if keep_history:
                self.history = package[SERIALIZE_KEY_HISTORY]
            self.best_states = package[SERIALIZE_KEY_BEST_STATES]


    # solver.train()
    def train(self):
        # Optimizing the model
        if self.history:
            logger.info("Replaying metrics from previous run")
        for epoch, metrics in enumerate(self.history):
            info = " ".join(f"{k.capitalize()}={v:.5f}" for k, v in metrics.items())
            logger.info(f"Epoch {epoch + 1}: {info}")

        logger.info('-' * 70)
        logger.info("Trainable Params:")
        for name, model in self.models.items():
            n_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
            mb = n_params * 4 / 2 ** 20
            logger.info(f"{name}: parameters: {n_params}, size: {mb} MB")

        torch.set_num_threads(1)

        best_loss = None
        self.best_states = {}

        for epoch in range(len(self.history), self.epochs):
            # Train one epoch
            self.model.train()
            start = time.time()
            logger.info('-' * 70)
            logger.info("Training...")

            # here is the loss function
            losses = self._run_one_epoch(epoch)

            logger_msg = f'Train Summary | End of Epoch {epoch + 1} | Time {time.time() - start:.2f}s | ' \
                         + ' | '.join([f'{k} Loss {v:.5f}' for k, v in losses.items()])
            logger.info(bold(logger_msg))
            losses = {k + '_loss': v for k, v in losses.items()}
            valid_losses = {}
            evaluation_loss = None

            evaluated_on_test_data = False

            if self.cross_valid and ((epoch + 1) % self.cross_valid_every == 0 or epoch == self.epochs - 1)\
                    and self.cv_loader:
                # Cross validation
                cross_valid_start = time.time()
                logger.info('-' * 70)
                logger.info('Cross validation...')
                
                self.model.eval()
                with torch.no_grad():
                    # if valid test equals all of test data, then
                    if self.args.valid_equals_test:
                        pass
                        # enhance_valid_data = (epoch + 1) % self.eval_every == 0 or epoch == self.epochs - 1 and self.tt_loader
                        # valid_losses, enhanced_filenames = self._get_valid_losses_on_test_data(epoch,
                        #                                                                enhance=enhance_valid_data)
                        # evaluated_on_test_data = True
                    else:
                        valid_losses = self._run_one_epoch(epoch, cross_valid=True)
                
                self.model.train()
                evaluation_loss = valid_losses['evaluation']
                logger_msg = f'Validation Summary | End of Epoch {epoch + 1} | Time {time.time() - cross_valid_start:.2f}s | ' \
                             + ' | '.join([f'{k} Valid Loss {v:.5f}' for k, v in valid_losses.items()])
                logger.info(bold(logger_msg))
                valid_losses = {'valid_' + k + '_loss': v for k, v in valid_losses.items()}

                best_loss = min(pull_metric(self.history, 'valid_evaluation_loss') + [evaluation_loss])
                # Save the best model
                if evaluation_loss == best_loss:
                    logger.info(bold('New best valid loss %.4f'), evaluation_loss)
                    self.best_states = self._copy_models_states()
                    # a bit weird that we don't save/load optimizers' best states. Should we?


            metrics = {**losses, **valid_losses}

            if evaluation_loss:
                metrics.update({METRICS_KEY_EVALUATION_LOSS: evaluation_loss})

            if best_loss:
                metrics.update({METRICS_KEY_BEST_LOSS: best_loss})

            # evaluate and enhance samples every 'eval_every' argument number of epochs
            # also evaluate on last epoch
            if ((epoch + 1) % self.eval_every == 0 or epoch == self.epochs - 1) and self.tt_loader:

                # Evaluate on the testset
                logger.info('-' * 70)
                logger.info('Evaluating on the test set...')
                # If best state exists and evalute_on_best configured, we switch to the best known model for testing.
                # Otherwise we use last state
                if self.args.evaluate_on_best and self.best_states:
                    logger.info('Loading best state.')
                    best_state = self.best_states[GENERATOR_KEY]
                else:
                    logger.info('Using last state.')
                    best_state = self.model.state_dict()
                with swap_state(self.model, best_state):
                    # enhance some samples
                    logger.info('Enhance and save samples...')
                    evaluation_start = time.time()

                    if evaluated_on_test_data:
                        logger.info('Samples already evaluated in cross validation, calculating metrics.')
                        enhanced_dataset = PrHrSet(self.args.samples_dir, enhanced_filenames)
                        enhanced_dataloader = distrib.loader(enhanced_dataset, batch_size=1, shuffle=False, num_workers=self.args.num_workers)
                        lsd, visqol = evaluate_on_saved_data(self.args, enhanced_dataloader, epoch)
                    elif self.args.joint_evaluate_and_enhance:
                        logger.info('Jointly evaluating and enhancing.')
                        # lsd, visqol, enhanced_filenames = evaluate(self.args, self.tt_loader, epoch,
                                                            #   self.model)
                    else: # opposed to above cases, no spectrograms saved in samples directory.
                        enhanced_filenames = enhance(self.tt_loader, self.model, self.args)
                        enhanced_dataset = PrHrSet(self.args.samples_dir, enhanced_filenames)
                        enhanced_dataloader = DataLoader(enhanced_dataset, batch_size=1, shuffle=False)
                        lsd, visqol = evaluate_on_saved_data(self.args, enhanced_dataloader, epoch)

                    if epoch == self.epochs - 1 and self.args.log_results:
                        # log results at last epoch
                        if not 'enhanced_dataloader' in locals():
                            pass
                            # enhanced_dataset = PrHrSet(self.args.samples_dir, enhanced_filenames)
                            # enhanced_dataloader = DataLoader(enhanced_dataset, batch_size=1, shuffle=False)

                        logger.info('logging results to wandb...')
                        # create_wandb_table(self.args, enhanced_dataloader, epoch)


                    logger.info(bold(f'Evaluation Time {time.time() - evaluation_start:.2f}s'))

                # metrics.update({METRICS_KEY_LSD: lsd, METRICS_KEY_VISQOL: visqol})


            wandb.log(metrics, step=epoch)
            self.history.append(metrics)
            info = " | ".join(f"{k.capitalize()} {v:.5f}" for k, v in metrics.items())
            logger.info('-' * 70)
            logger.info(bold(f"Overall Summary | Epoch {epoch + 1} | {info}"))

            if distrib.rank == 0:
                json.dump(self.history, open(self.history_file, "w"), indent=2)
                # Save model each epoch
                if self.checkpoint:
                    serialize(self.models, self.optimizers, self.history, self.best_states, self.args)
                    logger.debug("Checkpoint saved to %s", self.checkpoint_file.resolve())


    def _run_one_epoch(self, epoch, cross_valid=False):
        total_losses = {}
        total_loss = 0
        data_loader = self.tr_loader if not cross_valid else self.cv_loader

        # get a different order for distributed training, otherwise this will get ignored
        data_loader.epoch = epoch

        label = ["Train", "Valid"][cross_valid]
        name = label + f" | Epoch {epoch + 1}"
        logprog = LogProgress(logger, data_loader, updates=self.num_prints, name=name)

        # return_spec can be used to debug model and see explicit spectral output of model
        return_spec = 'return_spec' in self.args.experiment and self.args.experiment.return_spec

        for i, data in enumerate(logprog):
            # lr_mag, hr_mag
            lr, hr = [x.to(self.device) for x in data]
            raw_mag = hr[:, :, :-1, :]
        
            # print(lr.shape) # torch.Size([16, 1, 2049, 126])
            # print(hr.shape)

            restore_mag = self.dmodel(lr)
            hr_reprs = {'mag': raw_mag}
            pr_reprs = {'mag': restore_mag}

            # 损失从这计算的
            losses = self._get_losses(hr_reprs, pr_reprs)
            
            total_generator_loss = 0
            for loss_name, loss in losses['generator'].items():
                total_generator_loss += loss

            # optimize model in training mode
            if not cross_valid:
                self._optimize(total_generator_loss)
                if self.adversarial_mode:
                    self._optimize_adversarial(losses['discriminator'])

            total_loss += total_generator_loss.item()
            for loss_name, loss in losses['generator'].items():
                total_loss_name = 'generator_' + loss_name
                if total_loss_name in total_losses:
                    total_losses[total_loss_name] += loss.item()
                else:
                    total_losses[total_loss_name] = loss.item()

            logprog.update(total_loss=format(total_loss / (i + 1), ".5f"))
            # Just in case, clear some memory
            if return_spec:
                del pr_spec, hr_spec
            del pr_reprs, hr_reprs, raw_mag, restore_mag, hr, lr

        avg_losses = {'total': total_loss / (i + 1)}
        avg_losses.update({'evaluation': total_loss / (i + 1)})
        for loss_name, loss in total_losses.items():
            avg_losses.update({loss_name: loss / (i + 1)})

        return avg_losses


    # this function is very similar to _run_one_epoch, except it runs on *test* data-loader and returns the names of
    # enhanced files for later use. Kind of ugly...
    # def _get_valid_losses_on_test_data(self, epoch, enhance):
    #     total_losses = {}
    #     total_loss = 0
    #     data_loader = self.tt_loader

    #     # get a different order for distributed training, otherwise this will get ignored
    #     data_loader.epoch = epoch

    #     name = f"Valid | Epoch {epoch + 1}"
    #     logprog = LogProgress(logger, data_loader, updates=self.num_prints, name=name)

    #     total_filenames = []

    #     for i, data in enumerate(logprog):
    #         (lr, lr_path), (hr, hr_path) = data
    #         lr = lr.to(self.device)
    #         hr = hr.to(self.device)

    #         filename = Path(hr_path[0]).stem
    #         total_filenames += filename
    #         if self.args.experiment.model == 'aero':
    #             hr_spec = self.model._spec(hr, scale=True).detach()
    #             pr_time, pr_spec, lr_spec = self.dmodel(lr, return_spec=True, return_lr_spec=True)
    #             pr_spec = pr_spec.detach()
    #             lr_spec = lr_spec.detach()
    #         else:
    #             nfft = self.args.experiment.nfft
    #             win_length = nfft // 4
    #             pr_time = self.model(lr)
    #             pr_spec = spectro(pr_time, n_fft=nfft, win_length=win_length)
    #             lr_spec = spectro(lr, n_fft=nfft, win_length=win_length)
    #             hr_spec = spectro(hr, n_fft=nfft, win_length=win_length)

    #         pr_time = match_signal(pr_time, hr.shape[-1])

    #         if enhance:
    #             save_wavs(pr_time, lr, hr, [os.path.join(self.args.samples_dir, filename)], self.args.experiment.lr_sr,
    #                       self.args.experiment.hr_sr)
    #             save_specs(lr_spec, pr_spec, hr_spec, os.path.join(self.args.samples_dir, filename))

    #         hr_reprs = {'time': hr, 'spec': hr_spec}
    #         pr_reprs = {'time': pr_time, 'spec': pr_spec}

    #         losses = self._get_losses(hr_reprs, pr_reprs)
    #         total_generator_loss = 0
    #         for loss_name, loss in losses['generator'].items():
    #             total_generator_loss += loss

    #         total_loss += total_generator_loss.item()
    #         for loss_name, loss in losses['generator'].items():
    #             total_loss_name = 'generator_' + loss_name
    #             if total_loss_name in total_losses:
    #                 total_losses[total_loss_name] += loss.item()
    #             else:
    #                 total_losses[total_loss_name] = loss.item()

    #         for loss_name, loss in losses['discriminator'].items():
    #             total_loss_name = 'discriminator_' + loss_name
    #             if total_loss_name in total_losses:
    #                 total_losses[total_loss_name] += loss.item()
    #             else:
    #                 total_losses[total_loss_name] = loss.item()

    #         logprog.update(total_loss=format(total_loss / (i + 1), ".5f"))
    #         # Just in case, clear some memory
    #         del pr_reprs, hr_reprs

    #     avg_losses = {'total': total_loss / (i + 1)}
    #     avg_losses.update({'evaluation': total_loss / (i + 1)})
    #     for loss_name, loss in total_losses.items():
    #         avg_losses.update({loss_name: loss / (i + 1)})

    #     return avg_losses, total_filenames if enhance else None


    def _get_losses(self, hr, pr):

        hr_time = hr['mag']   # torch.Size([16, 1, 256, 501])
        pr_time = pr['mag']

        losses = {'generator': {}}
        with torch.autograd.set_detect_anomaly(True):
            losses['generator'].update({'l1': 100*F.l1_loss(pr_time, hr_time)})
            # if 'l1' in self.args.losses:
            #     losses['generator'].update({'l1': F.l1_loss(pr_time, hr_time)})
            # if 'l2' in self.args.losses:
            #     losses['generator'].update({'l2': F.mse_loss(pr_time, hr_time)})
            # # here
            # if 'stft' in self.args.losses:
            #     stft_loss = self._get_stft_loss(pr_time, hr_time)
            #     losses['generator'].update({'stft': stft_loss})

        return losses

    def _get_stft_loss(self, pr, hr):
        sc_loss, mag_loss = self.mrstftloss(pr.squeeze(1), hr.squeeze(1))
        stft_loss = sc_loss + mag_loss
        return stft_loss



    def _optimize(self, loss):
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

    def _optimize_adversarial(self, discriminator_losses):
        total_disc_loss = sum(list(discriminator_losses.values()))
        disc_optimizer = self.disc_optimizers['disc_optimizer']
        disc_optimizer.zero_grad()
        total_disc_loss.backward()
        disc_optimizer.step()