"""
This code is based on Facebook's HDemucs code: https://github.com/facebookresearch/demucs
"""
"""Conveniance wrapper to perform STFT and iSTFT"""

import torch as th

# 将输入信号转换为频谱图，适用于音频信号的频域分析。

# return spectrogram
def spectro(x, n_fft=512, hop_length=None, pad=0, win_length=None):
    *other, length = x.shape
    x = x.reshape(-1, length)
    # return_complex=True返回复数格式
    z = th.stft(x,
                n_fft * (1 + pad),
                hop_length or n_fft // 4,
                window=th.hann_window(win_length).to(x),
                win_length=win_length or n_fft,
                normalized=True,
                center=True,
                return_complex=True,
                pad_mode='reflect')
    _, freqs, frame = z.shape
    return z.view(*other, freqs, frame)

# 将频谱图转换回时域信号，适用于音频信号的重建。
# istft转换为时域信号
def ispectro(z, hop_length=None, length=None, pad=0, win_length=None):
    *other, freqs, frames = z.shape
    n_fft = 2 * freqs - 2
    z = z.view(-1, freqs, frames)
    win_length = win_length or n_fft // (1 + pad)
    x = th.istft(z,
                 n_fft,
                 hop_length or n_fft // 2,
                 window=th.hann_window(win_length).to(z.real),
                 win_length=win_length,
                 normalized=True,
                 length=length,
                 center=True)
    _, length = x.shape
    return x.view(*other, length)