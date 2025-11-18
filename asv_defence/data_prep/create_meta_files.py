#!/usr/bin/env python
# -*- encoding: utf-8 -*-


import os
import sys
import argparse
import glob
import torchaudio
from collections import namedtuple
import json
from multiprocessing import Process, Manager
import pathlib


FILE_PATTERN = '*.wav'  
TRAIN_RATIO = 0.9        

Info = namedtuple("Info", ["length", "sample_rate", "channels"])

def get_info(path):
    info = torchaudio.info(path)
    if hasattr(info, 'num_frames'):
        return Info(info.num_frames, info.sample_rate, info.num_channels)
    else:
        siginfo = info[0]
        return Info(siginfo.length // siginfo.channels, siginfo.rate, siginfo.channels)

def process_speaker(speaker_path, shared_meta, n_samples_limit):
    if n_samples_limit and len(shared_meta) >= n_samples_limit:
        return
    
   
    for chapter_dir in os.listdir(speaker_path):
        chapter_path = os.path.join(speaker_path, chapter_dir)
        if not os.path.isdir(chapter_path):
            continue
        
        
        audio_files = glob.glob(os.path.join(chapter_path, FILE_PATTERN))
        for file in audio_files:
            if n_samples_limit and len(shared_meta) >= n_samples_limit:
                return
            try:
                info = get_info(file)
                shared_meta.append((file, info.length))
            except Exception as e:
                print(f"Error processing {file}: {str(e)}")

def create_subdirs_meta(speaker_paths, n_samples_limit):
    with Manager() as manager:
        shared_meta = manager.list()
        processes = []
        
        for speaker_path in speaker_paths:
            p = Process(target=process_speaker, 
                      args=(speaker_path, shared_meta, n_samples_limit))
            p.start()
            processes.append(p)
        
        for p in processes:
            p.join()
        
        meta = list(shared_meta)
        if n_samples_limit:
            meta = meta[:n_samples_limit]
        return meta

def find_speakers(data_dir):
    
    speaker_paths = []
    
    
    for subset in os.listdir(data_dir):
        subset_path = os.path.join(data_dir, subset)
        if not os.path.isdir(subset_path):
            continue
        
        
        for speaker_id in os.listdir(subset_path):
            speaker_path = os.path.join(subset_path, speaker_id)
            if os.path.isdir(speaker_path):
                speaker_paths.append(speaker_path)
    
    
    return sorted(speaker_paths)

def create_meta(data_dir, n_samples_limit=None):
    speaker_paths = find_speakers(data_dir)
    
    if not speaker_paths:
        raise ValueError(f"No speakers found in {data_dir}")
    
    
    split_idx = int(len(speaker_paths) * TRAIN_RATIO)
    train_speakers = speaker_paths[:split_idx]
    test_speakers = speaker_paths[split_idx:]
    
    print(f"Found {len(speaker_paths)} speakers total")
    print(f"Using {len(train_speakers)} for training")
    print(f"Using {len(test_speakers)} for testing")
    
    train_meta = create_subdirs_meta(train_speakers, n_samples_limit)
    test_meta = create_subdirs_meta(test_speakers, n_samples_limit)
    
    return train_meta, test_meta

def parse_args():
    parser = argparse.ArgumentParser(description='Create metadata for LibriSpeech')
    parser.add_argument('data_dir', help='Root directory of LibriSpeech dataset')
    parser.add_argument('target_dir', help='Output directory for JSON files')
    parser.add_argument('json_filename', help='Base name for output JSON files')
    parser.add_argument('--n_samples_limit', type=int, help='Limit number of samples per set')
    return parser.parse_args()

def main():
    args = parse_args()
    
    os.makedirs(args.target_dir, exist_ok=True)
    os.makedirs(os.path.join(args.target_dir, 'tr'), exist_ok=True)
    os.makedirs(os.path.join(args.target_dir, 'val'), exist_ok=True)

    train_meta, test_meta = create_meta(args.data_dir, args.n_samples_limit)

   
    with open(os.path.join(args.target_dir, 'tr', f"{args.json_filename}.json"), 'w') as f:
        json.dump(train_meta, f, indent=2)
    
    with open(os.path.join(args.target_dir, 'val', f"{args.json_filename}.json"), 'w') as f:
        json.dump(test_meta, f, indent=2)
    
    print(f"Metadata generation complete. Saved to {args.target_dir}")

if __name__ == '__main__':
    main()
