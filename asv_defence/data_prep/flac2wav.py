import os
import argparse
import torchaudio
from tqdm import tqdm 

def convert_flac_to_wav(flac_path, wav_path):

    try:

        waveform, sample_rate = torchaudio.load(flac_path)

        torchaudio.save(wav_path, waveform, sample_rate)
    except Exception as e:
        print(f"Error converting {flac_path}: {str(e)}")

def process_directory(input_dir, output_dir):

    os.makedirs(output_dir, exist_ok=True)


    for root, _, files in os.walk(input_dir):

        relative_path = os.path.relpath(root, input_dir)
        output_subdir = os.path.join(output_dir, relative_path)
        os.makedirs(output_subdir, exist_ok=True)


        for file in tqdm(files, desc=f"Processing {relative_path}"):
            if file.endswith(".flac"):
                flac_path = os.path.join(root, file)
                wav_file = file.replace(".flac", ".wav")
                wav_path = os.path.join(output_subdir, wav_file)
                convert_flac_to_wav(flac_path, wav_path)

def parse_args():
    parser = argparse.ArgumentParser(description="Convert FLAC files to WAV format")
    parser.add_argument("input_dir", help="Directory containing FLAC files")
    parser.add_argument("output_dir", help="Directory to save WAV files")
    return parser.parse_args()

def main():
    args = parse_args()
    print(f"Converting FLAC files from {args.input_dir} to WAV files in {args.output_dir}")
    process_directory(args.input_dir, args.output_dir)
    print("Conversion complete!")

if __name__ == "__main__":
    main()