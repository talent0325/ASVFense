## Requirements

Install requirements specified in `requirements.txt`:  
```pip install -r requirments.txt```

We ran our code on CUDA/11.3, we therefore installed pytorch/torchvision/torchaudio with the following:

```
pip install torch==1.12.1+cu113 torchvision==0.13.1+cu113 torchaudio==0.12.1 --extra-index-url https://download.pytorch.org/whl/cu113
```


## Train

Run `train.py` with `dset` and `experiment` parameters.  

e.g. for `n_fft=512` and `hop_length=64`:
```
python train.py dset=mag_restore experiment=mag
```

To train with multiple GPUs, run with parameter `ddp=true`. e.g.
```
python train.py dset=mag_restore experiment=mag ddp=true
```


## Predict (on single sample)

- Copy/download appropriate `checkpoint.th` file to directory (make sure that the corresponding nfft,hop_length parameters
correspond to experiment file)
- Run predict.py with appending new `filename` and `output` parameters via hydra framework, corresponding to the input file and output directory respectively.eriment

e.g. 
``` 
python predict.py \
  dset=mag_restore \
  experiment=mag \
  +filename=/data1/asv_defense/asv_defence/adv_audio/1580-3.2-9.7-inter-1688-142285-0007.wav \
  +output=/data1/asv_defense/asv_defence/defend_audio/
```
