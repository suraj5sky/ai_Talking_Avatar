import os
import subprocess
import logging
from typing import Tuple
import cv2

logger = logging.getLogger(__name__)

def generate_lipsync_video(media_path: str, audio_path: str, output_path: str,
                          mode: str = 'image', resolution: str = 'fullhd',
                          quality: str = 'medium') -> Tuple[bool, str]:
    """
    Generate lipsync video using Wav2Lip
    
    Args:
        media_path: Path to input image/video file
        audio_path: Path to input audio file
        output_path: Path for output video file
        mode: Processing mode ('image' or 'video')
        resolution: Output resolution (not currently used in command)
        quality: Quality preset ('low', 'medium', 'high')
    
    Returns:
        Tuple of (success: bool, message: str)
    """
    try:
        # Base directory (project root)
        BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        INFERENCE_SCRIPT = os.path.join(BASE_DIR, "backend", "wav2lip", "inference.py")
        CHECKPOINT_PATH = os.path.join(BASE_DIR, "backend", "models", "wav2lip.pth")
        TEMP_DIR = os.path.join(BASE_DIR, "temp")

        # Create temp directory
        os.makedirs(TEMP_DIR, exist_ok=True)

        # Ensure paths are absolute
        media_path = os.path.abspath(media_path)
        audio_path = os.path.abspath(audio_path)
        output_path = os.path.abspath(output_path)

        # Log paths for debugging
        logger.debug(f"Base directory: {BASE_DIR}")
        logger.debug(f"Inference script: {INFERENCE_SCRIPT}")
        logger.debug(f"Checkpoint path: {CHECKPOINT_PATH}")
        logger.debug(f"Temp directory: {TEMP_DIR}")
        logger.debug(f"Media path: {media_path}")
        logger.debug(f"Audio path: {audio_path}")
        logger.debug(f"Output path: {output_path}")

        # Enhanced input validation
        if not os.path.exists(media_path):
            return False, f"Media file not found: {media_path}"
        if not os.path.exists(audio_path):
            return False, f"Audio file not found: {audio_path}"
        if not os.path.exists(CHECKPOINT_PATH):
            return False, f"Checkpoint file not found: {CHECKPOINT_PATH}"
        if not os.path.exists(INFERENCE_SCRIPT):
            return False, f"Inference script not found: {INFERENCE_SCRIPT}"
        if not os.path.isdir(os.path.dirname(output_path)):
            return False, f"Output directory does not exist: {os.path.dirname(output_path)}"

        # Validate media file based on mode
        if mode == 'video':
            if not media_path.lower().endswith(('.mp4', '.mov', '.avi')):
                return False, "Video mode requires .mp4, .mov or .avi file"
        elif mode == 'image':
            if not media_path.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                return False, "Image mode requires .png, .jpg, .jpeg or .webp file"
        else:
            return False, f"Invalid mode: {mode}"

        # Build command with absolute paths
        command = [
            "python",
            INFERENCE_SCRIPT,
            "--checkpoint_path", CHECKPOINT_PATH,
            "--face", media_path,
            "--audio", audio_path,
            "--outfile", output_path,
            "--pads", "0", "10", "0", "0"
        ]

        # Mode-specific parameters
        if mode == 'image':
            command.extend(["--static", "True"])
        else:
            command.extend(["--fps", "25"])  # Standard video framerate

        # Quality settings (resize factor)
        quality_settings = {
            'low': "4",    # Fastest but lowest quality
            'medium': "2", # Balanced
            'high': "1"    # Slowest but best quality
        }
        command.extend(["--resize_factor", quality_settings.get(quality, "2")])

        logger.info(f"Executing command: {' '.join(command)}")

        # Execute with timeout and capture detailed output
        try:
            result = subprocess.run(
                command,
                check=True,
                capture_output=True,
                text=True,
                timeout=1800,  # 30 minutes timeout
                cwd=BASE_DIR  # Run from project root
            )
            logger.info(f"Wav2Lip stdout: {result.stdout}")
        except subprocess.CalledProcessError as e:
            error_msg = f"Wav2Lip failed with exit code {e.returncode}\nStdout: {e.stdout}\nStderr: {e.stderr}"
            logger.error(error_msg)
            return False, error_msg
        except subprocess.TimeoutExpired as e:
            logger.error(f"Processing timed out after 30 minutes\nStdout: {e.stdout}\nStderr: {e.stderr}")
            return False, "Processing took too long and was stopped"

        # Verify output was created
        if not os.path.exists(output_path):
            error_msg = result.stderr or "Output file not generated (no error details available)"
            logger.error(f"Output verification failed: {error_msg}")
            return False, error_msg

        # Verify output file size is reasonable
        if os.path.getsize(output_path) < 1024:  # Less than 1KB is probably invalid
            return False, "Output file is too small (processing likely failed)"

        # Validate video file
        cap = cv2.VideoCapture(output_path)
        if not cap.isOpened():
            cap.release()
            return False, "Output video is invalid or corrupted"
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        cap.release()
        if frame_count < 1:
            return False, "Output video has no frames"

        return True, "Success"

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return False, f"Unexpected error occurred: {str(e)}"