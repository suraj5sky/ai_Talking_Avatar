import os
import sys
sys.path.append('backend/wav2lip')

from wav2lip.inference import main as wav2lip_main

import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--face', type=str, required=True)
parser.add_argument('--audio', type=str, required=True)
parser.add_argument('--outfile', type=str, required=True)

args = parser.parse_args()

wav2lip_main(args)
