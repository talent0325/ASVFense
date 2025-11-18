#!/usr/bin/env python
# -*- encoding: utf-8 -*-

import math
import os

import time

import hydra
import torch
import logging
from pathlib import Path
import librosa
import matplotlib.pyplot as plt
import soundfile as sf
import numpy as np
# import librosa.display

import torchaudio
from torchaudio.functional import resample

from src.enhance import write
from src.models import modelFactory
from src.model_serializer import SERIALIZE_KEY_MODELS, SERIALIZE_KEY_BEST_STATES, SERIALIZE_KEY_STATE
from src.utils import bold


logger = logging.getLogger(__name__)


SEGMENT_DURATION_SEC = 10

def _load_model(args):
    model_name = args.experiment.model
    checkpoint_file = Path(args.checkpoint_file)
    model = modelFactory.get_model(args)['generator']
    package = torch.load(checkpoint_file, 'cpu')
    load_best = args.continue_best
    if load_best:
        logger.info(bold(f'Loading model {model_name} from best state.'))
        model.load_state_dict(
            package[SERIALIZE_KEY_BEST_STATES][SERIALIZE_KEY_MODELS]['generator'][SERIALIZE_KEY_STATE])
    else:
        logger.info(bold(f'Loading model {model_name} from last state.'))
        model.load_state_dict(package[SERIALIZE_KEY_MODELS]['generator'][SERIALIZE_KEY_STATE])

    return model


@hydra.main(config_path="conf", config_name="main_config")  # for latest version of hydra=1.0
def main(args):
    global __file__
    __file__ = hydra.utils.to_absolute_path(__file__)

    print(args)
    # model = _load_model(args)
    # device = torch.device('cuda')
    # model.cuda()
    
    # MARK: attack path
    root = '/data1/asv_defense/asv_defence/'
    attack_folder = os.path.join(root, 'adv_audio') # change here to load the attack folder 
    
    # spk_iter = os.listdir(attack_folder) # list of speaker ids
    audio_files = [f for f in os.listdir(attack_folder) if f.endswith('.wav')]
    for audio_name in audio_files:
        # spk_dir = os.path.join(attack_folder, spk_id) # path to one speaker
        # audio_iter = os.listdir(spk_dir) # list of waveforms
        # for ii, audio_name in enumerate(audio_iter): # for all wavforms
            model = _load_model(args)
            device = torch.device('cuda')
            model.cuda()
            filename = os.path.join(attack_folder, audio_name)
            # filename = args.filename
            file_basename = Path(filename).stem
            # output_dir = args.output
            # print(filename)
            lr_sig, sr = torchaudio.load(filename)

            if args.experiment.upsample:
                lr_sig = resample(lr_sig, sr, args.experiment.hr_sr)
                sr = args.experiment.hr_sr

            logger.info(f'lr wav shape: {lr_sig.shape}')


            segment_duration_samples = sr * SEGMENT_DURATION_SEC
            n_chunks = math.ceil(lr_sig.shape[-1] / segment_duration_samples)
            logger.info(f'number of chunks: {n_chunks}')


            lr_chunks = []
            for i in range(n_chunks):
                start = i * segment_duration_samples
                end = min((i + 1) * segment_duration_samples, lr_sig.shape[-1])
                lr_chunks.append(lr_sig[:, start:end])

            pr_chunks = []
            raw_chunks = []

            model.eval()
            pred_start = time.time()
            with torch.no_grad():
                for i, lr_chunk in enumerate(lr_chunks):
                    total_fre = 8000
                    n_stft = 257
                    shengmen_down = math.floor(n_stft*50/total_fre)
                    shengmen_up = math.ceil(n_stft*300/total_fre)
                    liwo_down = math.floor(n_stft*4000/total_fre)
                    liwo_up = math.ceil(n_stft*5500/total_fre)
                    fuyin_down = math.floor(n_stft*6500/total_fre)
                    fuyin_up = math.ceil(n_stft*7800/total_fre)

                    waveform = lr_chunk.squeeze().cpu().numpy()
                    noise_uni = np.random.uniform(-0.002, 0.002, waveform.shape)
                    audio_sim = waveform + noise_uni

                    amp = np.abs(librosa.stft(waveform,n_fft=512))
                    amp_sim = np.abs(librosa.stft(audio_sim,n_fft=512))

                    pitches, magnitudes = librosa.piptrack(S=amp,sr=16000,threshold=1,ref=np.mean,fmin=300,fmax=4000)
                    ts = np.average(magnitudes[np.nonzero(magnitudes)])
                    max_dif = np.zeros(amp.shape[0])
					# AFPM
                    for j in range(amp.shape[0]):
                        # high-speaker-related
                        if j in range(shengmen_down,shengmen_up) or j in range(liwo_down,liwo_up) or j in range(fuyin_down,fuyin_up):
                            max_dif[j]=np.max(np.abs(amp_sim[j,:]-amp[j,:]))
                            amp1 = amp[j,:]
                            amp1[np.where((amp1>0) & (amp1<max_dif[j]*15))] = 0
                            amp[j,:] = amp1
                        # low-speaker-related
                        else:
                            amp2 = amp[j,:]
                            amp2[amp2<ts*0.7] = 0
                            amp[j,:] = amp2

                    lr_amp = torch.tensor(amp).unsqueeze(0) # torch.Size([1, 257, 1251])
                    print(lr_amp.shape)
                    lr_amp = lr_amp.unsqueeze(0)
                    print('here')
                    print(lr_amp.shape)

                    # raw_mag, restore_mag = model(lr_amp.to(device), lr_amp.to(device))
                    restore_mag = model(lr_amp.to(device), lr_amp.to(device))
                    # print(restore_mag.shape)  # torch.Size([1, 1, 256, 1251]) ([1, 1, 256, 512])
                    pr_chunks.append(restore_mag.cpu())
                    # raw_chunks.append(raw_mag.cpu())

            pred_duration = time.time() - pred_start
            logger.info(f'prediction duration: {pred_duration}')


            pr = torch.concat(pr_chunks, dim=-1)
            mag = pr.squeeze().numpy()
            # raw_mag = torch.concat(raw_chunks, dim=-1)
            # raw_mag = raw_mag.squeeze().numpy()

            logger.info(f'pr wav shape: {mag.shape}')         # (256, 1996)
            # logger.info(f'raw wav shape: {raw_mag.shape}')    # (256, 1996)

            # plot magnititude
            # MARK: plot
            
            plt.figure(figsize=(6,4))
            librosa.display.specshow(librosa.amplitude_to_db(mag),sr=sr,x_axis='time',y_axis='hz',cmap='magma')
            plt.colorbar(format='%+0.2f dB')
            plt.title('重建频谱图')
            plt.xlabel('时间 (s)')
            plt.ylabel('频率 (Hz)')
            plt.title('reconstructed spectrogram')
            plt.xlabel('Time (s)')
            plt.ylabel('Frequency (Hz)')
            plt.tight_layout()
            # plt.show()
            # TODO:
            plt.savefig(f"./asv_defence/plt/{audio_name}.png")
            

            # reconstructed
            zero_padding = np.zeros((1, mag.shape[1]))
            padded_mag = np.concatenate((mag, zero_padding), axis=0)    # (257, 1996)
            # mag->wav and save
            waveform_trans = librosa.griffinlim(padded_mag, n_fft=512)  # (257, 1996)
            print(waveform_trans.shape)

            # MARK: add other savepath
            defend_spk_dir = os.path.join(root, 'ASVfense_defend_audio')
            # defend_spk_dir = os.path.join(root, 'defend_audio')
            os.makedirs(defend_spk_dir, exist_ok=True)
            
            sf.write(os.path.join(defend_spk_dir, audio_name),waveform_trans,16000,'FLOAT')
    
   
if __name__ == "__main__":
    main()
