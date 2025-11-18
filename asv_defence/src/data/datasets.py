#!/usr/bin/env python
# -*- encoding: utf-8 -*-

import json
import logging
import os

import torch
from tqdm import tqdm
import torchaudio
import math
import numpy as np
import librosa

from torch.nn import functional as F
from torchaudio.functional import resample
from torch.utils.data import Dataset
from torchaudio.transforms import Spectrogram

import sys
sys.path.append("/mnt1/shenrb/code/defence/aero_mag")
from src.data.audio import Audioset
from src.utils import match_signal

logger = logging.getLogger(__name__)


def match_files(lr, hr):
    """match_files.
    Sort files to match lr and hr filenames.
    :param lr: list of the low-resolution filenames
    :param hr: list of the high-resolution filenames
    """
    lr.sort()
    hr.sort()


def assert_sets(lr_set, hr_set):
    n_samples = len(lr_set)
    for i in tqdm(range(n_samples)):
        assert lr_set[i].shape == hr_set[i].shape


def match_source_to_target_length(source_sig, target_sig):
    target_len = target_sig.shape[-1]
    source_len = source_sig.shape[-1]
    if target_len < source_len:
        source_sig = source_sig[..., :target_len]
    elif target_len > source_len:
        source_sig = F.pad(source_sig, (0, target_len - source_len))
    return source_sig


class PrHrSet(Dataset):
    def __init__(self, samples_dir, filenames=None):
        self.samples_dir = samples_dir
        if filenames is not None:
            files = [i for i in os.listdir(samples_dir) if any(i for j in filenames if j in i)]
        else:
            files = os.listdir(samples_dir)

        self.hr_filenames = list(sorted(filter(lambda x: x.endswith('_flt.wav'), files)))
        self.lr_filenames = list(sorted(filter(lambda x: x.endswith('_raw.wav'), files)))
        self.pr_filenames = list(sorted(filter(lambda x: x.endswith('_pre.wav'), files)))

    def __len__(self):
        return len(self.hr_filenames)

    def __getitem__(self, i):
        lr_i, lr_sr = torchaudio.load(os.path.join(self.samples_dir, self.lr_filenames[i]))
        hr_i, hr_sr = torchaudio.load(os.path.join(self.samples_dir, self.hr_filenames[i]))
        pr_i, pr_sr = torchaudio.load(os.path.join(self.samples_dir, self.pr_filenames[i]))
        pr_i = match_signal(pr_i, hr_i.shape[-1])
        assert hr_i.shape == pr_i.shape

        lr_filename = self.lr_filenames[i]
        lr_filename = lr_filename[:lr_filename.index('_flt.wav')]

        hr_filename = self.hr_filenames[i]
        hr_filename = hr_filename[:hr_filename.index('_raw.wav')]

        pr_filename = self.pr_filenames[i]
        pr_filename = pr_filename[:pr_filename.index('_pre.wav')]

        assert lr_filename == hr_filename == pr_filename

        return lr_i, hr_i, pr_i, lr_filename


class LrHrSet(Dataset):
    def __init__(self, json_dir, lr_sr, hr_sr, stride=None, segment=None,
                 pad=True, with_path=False, stft=False, mask=True, win_len=64, hop_len=16, n_fft=4096, complex_as_channels=True,
                 upsample=True):
        """__init__.
        :param json_dir: directory containing both hr.json and lr.json
        :param stride: the stride used for splitting audio sequences in seconds
        :param segment: the segment length used for splitting audio sequences in seconds
        :param pad: pad the end of the sequence with zeros
        :param sample_rate: the signals sampling rate
        :param with_path: whether to return tensors with filepath
        :param stft: convert to spectrogram
        :param win_len: stft window length in seconds
        :param hop_len: stft hop length in seconds
        :param n_fft: stft number of frequency bins
        :param complex_as_channels: True - move complex dimension to channel dimension. output is [2, Fr, T]
                                    False - last dimension is complex channels, output is [1, Fr, T, 2]
        """

        self.lr_sr = lr_sr
        self.hr_sr = hr_sr
        self.stft = stft
        self.mask = mask
        self.with_path = with_path
        self.upsample = upsample

        if self.stft:
            self.window_length = int(self.hr_sr / 1000 * win_len)  # 64 ms
            self.hop_length = int(self.hr_sr / 1000 * hop_len)  # 16 ms
            self.window = torch.hann_window(self.window_length)
            self.n_fft = n_fft
            self.complex_as_channels = complex_as_channels
            self.spectrogram = Spectrogram(n_fft=n_fft, win_length=self.window_length, hop_length=self.hop_length,
                                           power=None)

        lr_json = os.path.join(json_dir, 'filtered.json')
        hr_json = os.path.join(json_dir, 'raw.json')

        with open(lr_json, 'r') as f:
            lr = json.load(f)
        with open(hr_json, 'r') as f:
            hr = json.load(f)


        lr_stride = stride * lr_sr if stride else None
        hr_stride = stride * hr_sr if stride else None
        # 2*16000=32000
        lr_length = segment * lr_sr if segment else None
        hr_length = segment * hr_sr if segment else None

        match_files(lr, hr)
        self.lr_set = Audioset(lr, sample_rate=lr_sr, length=lr_length, stride=lr_stride, pad=pad, channels=1,
                               with_path=with_path)
        self.hr_set = Audioset(hr, sample_rate=hr_sr, length=hr_length, stride=hr_stride, pad=pad, channels=1,
                               with_path=with_path)

        assert len(self.hr_set) == len(self.lr_set)


    def __getitem__(self, index):
        if self.with_path:
            hr_sig, hr_path = self.hr_set[index]
            lr_sig, lr_path = self.lr_set[index]
        else:
            hr_sig = self.hr_set[index]
            lr_sig = self.lr_set[index]     # torch.Size([1, 32000])
        
        # true
        if self.upsample:
            # lr_sig = resample(lr_sig, self.lr_sr, self.hr_sr)
            lr_sig = match_signal(lr_sig, hr_sig.shape[-1])

        # false
        if self.stft:
            hr_sig = torch.view_as_real(self.spectrogram(hr_sig))
            lr_sig = torch.view_as_real(self.spectrogram(lr_sig))
            if self.complex_as_channels:
                Ch, Fr, T, _ = hr_sig.shape
                hr_sig = hr_sig.reshape(2 * Ch, Fr, T)
                lr_sig = lr_sig.reshape(2 * Ch, Fr, T)
        
        if self.mask:
            total_fre = 8000
            n_stft = 257
            shengmen_down = math.floor(n_stft*50/total_fre)
            shengmen_up = math.ceil(n_stft*300/total_fre)
            liwo_down = math.floor(n_stft*4000/total_fre)
            liwo_up = math.ceil(n_stft*5500/total_fre)
            fuyin_down = math.floor(n_stft*6500/total_fre)
            fuyin_up = math.ceil(n_stft*7800/total_fre)

            waveform = lr_sig.squeeze().cpu().numpy()   # (32000,)
            noise_uni = np.random.uniform(-0.002, 0.002, waveform.shape)
            audio_sim = waveform + noise_uni
            
            a = np.max(np.abs(waveform))
            sr = 16000
            total_samples = len(waveform)
            pulse_signal = np.zeros_like(waveform)
            
            if np.random.rand() < 0.5: 
      	    # --- 随机均匀噪声数据增强 --- #
                noise_level = np.random.uniform(0.002, 0.01)  # 随机噪声强度
                noise_uni = np.random.uniform(-noise_level, noise_level, waveform.shape)
      				
                # --- 多端脉冲数据增强 --- #
                for _ in range(20):
                    amp = a * np.random.choice([1, -1])  # 带符号的幅度
                    duration = np.random.uniform(0.05, 0.1)  # 随机持续时间（秒）
                    pulse_samples = int(duration * sr)  # 持续样本数
                    # 生成脉冲位置
                    start = np.random.randint(0, total_samples - pulse_samples)
                    pulse_signal[start:start+pulse_samples] += amp
                    
                audio_sim += pulse_signal + noise_uni

            amp = np.abs(librosa.stft(waveform,n_fft=512))
            amp_sim = np.abs(librosa.stft(audio_sim,n_fft=512))

            pitches, magnitudes = librosa.piptrack(S=amp,sr=16000,threshold=1,ref=np.mean,fmin=300,fmax=4000)
            ts = np.average(magnitudes[np.nonzero(magnitudes)])
            max_dif = np.zeros(amp.shape[0])

            for j in range(amp.shape[0]):
                # high-speaker-related
                if j in range(shengmen_down,shengmen_up) or j in range(liwo_down,liwo_up) or j in range(fuyin_down,fuyin_up):
                    max_dif[j]=np.max(np.abs(amp_sim[j,:]-amp[j,:]))
                    amp1 = amp[j,:]
                    # amp1[np.where((amp1>0) & (amp1<max_dif[j]*25))] = 0
                    under_threshold = amp1 < max_dif[j] * 25
                    num_to_keep = int(np.sum(under_threshold) * 0.05)
                    indices_to_keep = np.random.choice(np.where(under_threshold)[0], num_to_keep, replace=False)
                    filtered_data = np.array([amp1[i] if not under_threshold[i] or i in indices_to_keep else 0 for i in range(len(amp1))])
                    amp[j,:] = filtered_data
                # low-speaker-related
                else:
                    amp2 = amp[j,:]
                    # amp2[amp2<ts*0.7] = 0
                    under_threshold = amp2 < ts
                    # 过滤90%
                    num_to_keep = int(np.sum(under_threshold) * 0.15)
                    indices_to_keep = np.random.choice(np.where(under_threshold)[0], num_to_keep, replace=False)
                    filtered_data = np.array([amp2[i] if not under_threshold[i] or i in indices_to_keep else 0 for i in range(len(amp2))])
                    # print(filtered_data.shape)
                    amp[j,:] = filtered_data

            lr_amp = torch.tensor(amp).unsqueeze(0) # torch.Size([1, 257, 251])
            hr = hr_sig.cpu().numpy()
            hr_amp = np.abs(librosa.stft(hr, n_fft=512))
            hr_amp = torch.tensor(hr_amp)    # torch.Size([1, 257, 251])

        # false
        if self.with_path:
            return (lr_sig, lr_path), (hr_sig, hr_path)
        else:
            return lr_amp, hr_amp

    def __len__(self):
        return len(self.lr_set)


if __name__ == "__main__":

    json_dir = '../../data_prep/mag_mask/tr'
    if json_dir.exists():
      lr_sr = 16000
      hr_sr = 16000
      pad = True
      stride_sec = 2
      segment_sec = 2
      stft = True
  
      data_set = LrHrSet(json_dir, lr_sr, hr_sr, stride_sec, segment_sec)
      item = data_set[0]
  
      # assert_sets(data_set.lr_set, data_set.hr_set)
      print(f'done asserting dataset from {json_dir}')
