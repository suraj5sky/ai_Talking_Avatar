from flask import Flask, request, send_from_directory, send_file, jsonify, Response
from flask_cors import CORS
import os
import uuid
import logging
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlencode
from werkzeug.utils import secure_filename
from wav2lip_processor import generate_lipsync_video
import traceback
import shutil
import tempfile

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "outputs")
MODEL_FOLDER = os.path.join(BASE_DIR, "backend", "models")
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
ALLOWED_AUDIO_EXTENSIONS = {'wav', 'mp3', 'ogg'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mov', 'avi'}
MAX_FILE_SIZE = 50 * 1024 * 1024
GOOGLE_DRIVE_FILE_ID = os.getenv("WAV2LIP_FILE_ID", "15vcWxm5A2KzqrJfD1H9U5rRxnJ0axmJd")
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(MODEL_FOLDER, exist_ok=True)

MODEL_PATH = os.path.join(MODEL_FOLDER, "wav2lip.pth")
if not os.path.exists(MODEL_PATH):
    logging.info("Downloading wav2lip.pth from Google Drive...")
    try:
        url = f"https://drive.google.com/uc?export=download&id={GOOGLE_DRIVE_FILE_ID}"
        session = requests.Session()
        session.headers.update({"User-Agent": USER_AGENT})
        response = session.get(url, stream=True, allow_redirects=True)
        response.raise_for_status()
        
        if "text/html" in response.headers.get("Content-Type", ""):
            logging.debug("Received HTML response, parsing for download link")
            with open("debug_response.html", "w", encoding="utf-8") as f:
                f.write(response.text)
            logging.debug("Saved HTML response to debug_response.html")
            
            soup = BeautifulSoup(response.text, "html.parser")
            download_link = soup.find("a", {"id": "uc-download-link"})
            if download_link and download_link.get("href"):
                download_url = urljoin(response.url, download_link["href"])
                logging.debug(f"Found download URL: {download_url}")
            else:
                form = soup.find("form")
                if form:
                    form_inputs = {}
                    for input_tag in form.find_all("input", {"name": True}):
                        form_inputs[input_tag["name"]] = input_tag.get("value", "")
                    form_action = form.get("action", "/uc")
                    form_method = form.get("method", "GET").upper()
                    logging.debug(f"Found form inputs: {form_inputs}, action: {form_action}, method: {form_method}")
                    
                    if "confirm" in form_inputs:
                        download_url = urljoin(response.url, form_action)
                        if form_method == "POST":
                            logging.debug(f"Using POST request to {download_url}")
                            response = session.post(download_url, data=form_inputs, stream=True)
                        else:
                            query_string = urlencode(form_inputs)
                            download_url = f"{download_url}?{query_string}"
                            logging.debug(f"Using GET request to {download_url}")
                            response = session.get(download_url, stream=True)
                        response.raise_for_status()
                    else:
                        logging.error("No confirm input found in form")
                        raise Exception("No confirm input found in form")
                else:
                    download_link = soup.find("a", href=lambda href: href and ("confirm=" in href or "uuid=" in href))
                    if download_link and download_link.get("href"):
                        download_url = urljoin(response.url, download_link["href"])
                        logging.debug(f"Found fallback download URL: {download_url}")
                    else:
                        logging.error("Could not find download link or form")
                        if "Sign in" in response.text or "Login" in response.text:
                            logging.error("HTML indicates login required.")
                        raise Exception("Could not find download link or confirmation form")
        else:
            download_url = url
            logging.debug("Direct download, no HTML response")
        
        if "text/html" in response.headers.get("Content-Type", ""):
            logging.error("Retry response is still HTML")
            with open("debug_response_retry.html", "w", encoding="utf-8") as f:
                f.write(response.text)
            raise Exception("Retry response is HTML, not the file")
        
        file_size = int(response.headers.get('content-length', 0))
        logging.info(f"File size: {file_size} bytes (~{file_size / (1024*1024):.2f} MB)")
        with open(MODEL_PATH, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        logging.info("Download complete.")
        
        final_size = os.path.getsize(MODEL_PATH)
        logging.info(f"Downloaded file size: {final_size} bytes (~{final_size / (1024*1024):.2f} MB)")
        if final_size < 1000000:
            raise Exception("Downloaded file is too small, likely not the model file")
    except Exception as e:
        logging.error(f"Failed to download wav2lip.pth: {str(e)}")
        raise Exception("Could not download model file")

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def allowed_file(filename, file_type):
    if '.' not in filename:
        return False
    extension = filename.rsplit('.', 1)[1].lower()
    if file_type == 'image':
        return extension in ALLOWED_IMAGE_EXTENSIONS
    elif file_type == 'audio':
        return extension in ALLOWED_AUDIO_EXTENSIONS
    elif file_type == 'video':
        return extension in ALLOWED_VIDEO_EXTENSIONS
    return False

@app.route('/')
def home():
    logger.debug("Serving index.html from ../frontend/")
    try:
        frontend_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
        file_path = os.path.join(frontend_dir, 'index.html')
        logger.debug(f"Attempting to serve file: {os.path.abspath(file_path)}")
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return jsonify({'error': 'Index file not found', 'details': f'{file_path} does not exist'}), 404
        return send_from_directory(frontend_dir, 'index.html')
    except Exception as e:
        logger.error(f"Error serving index.html: {str(e)}")
        return jsonify({'error': 'Frontend not found', 'details': str(e)}), 404

@app.route('/<path:filename>')
def static_files(filename):
    logger.debug(f"Serving static file: {filename}")
    try:
        frontend_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
        file_path = os.path.join(frontend_dir, filename)
        logger.debug(f"Attempting to serve file: {os.path.abspath(file_path)}")
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return jsonify({'error': 'File not found', 'details': f'{file_path} does not exist'}), 404
        return send_from_directory(frontend_dir, filename)
    except Exception as e:
        logger.error(f"Error serving static file {filename}: {str(e)}")
        return jsonify({'error': 'File not found', 'details': str(e)}), 404

@app.route('/api/lipsync', methods=['POST'])
def lipsync():
    logger.debug("Received lipsync request")
    try:
        if 'media' not in request.files or 'audio' not in request.files:
            return jsonify({
                'error': 'Missing files',
                'details': 'Both media and audio files are required',
                'code': 'MISSING_FILES'
            }), 400

        media_file = request.files['media']
        audio_file = request.files['audio']
        mode = request.form.get('mode', 'image')

        if media_file.filename == '' or audio_file.filename == '':
            return jsonify({
                'error': 'Empty files',
                'details': 'Selected files are empty',
                'code': 'EMPTY_FILES'
            }), 400

        if mode == 'image' and not allowed_file(media_file.filename, 'image'):
            return jsonify({
                'error': 'Invalid image',
                'details': 'Only PNG/JPEG images are supported',
                'code': 'INVALID_IMAGE'
            }), 400

        if mode == 'video' and not allowed_file(media_file.filename, 'video'):
            return jsonify({
                'error': 'Invalid video',
                'details': 'Only MP4/MOV videos are supported',
                'code': 'INVALID_VIDEO'
            }), 400

        if not allowed_file(audio_file.filename, 'audio'):
            return jsonify({
                'error': 'Invalid audio',
                'details': 'Only MP3/WAV audio is supported',
                'code': 'INVALID_AUDIO'
            }), 400

        unique_id = uuid.uuid4().hex
        media_ext = secure_filename(media_file.filename).rsplit('.', 1)[1].lower()
        audio_ext = secure_filename(audio_file.filename).rsplit('.', 1)[1].lower()
        
        media_path = os.path.join(UPLOAD_FOLDER, f"media_{unique_id}.{media_ext}")
        audio_path = os.path.join(UPLOAD_FOLDER, f"audio_{unique_id}.{audio_ext}")
        output_path = os.path.join(OUTPUT_FOLDER, f"output_{unique_id}.mp4")

        logger.debug(f"Saving media to: {media_path}")
        media_file.save(media_path)
        logger.debug(f"Saving audio to: {audio_path}")
        audio_file.save(audio_path)

        if not os.path.exists(media_path):
            logger.error(f"Media file not found: {media_path}")
            return jsonify({
                'error': 'File save failed',
                'details': f'Media file could not be saved: {media_path}',
                'code': 'FILE_SAVE_FAILED'
            }), 500
        if not os.path.exists(audio_path):
            logger.error(f"Audio file not found: {audio_path}")
            return jsonify({
                'error': 'File save failed',
                'details': f'Audio file could not be saved: {audio_path}',
                'code': 'FILE_SAVE_FAILED'
            }), 500

        logger.debug(f"Calling generate_lipsync_video with media: {media_path}, audio: {audio_path}, output: {output_path}")
        success, message = generate_lipsync_video(
            media_path,
            audio_path,
            output_path,
            mode=mode,
            resolution=request.form.get('resolution', 'fullhd'),
            quality=request.form.get('quality', 'medium')
        )

        if not success:
            logger.error(f"Generation failed: {message}")
            return jsonify({
                'error': 'Processing failed',
                'details': message,
                'code': 'PROCESSING_FAILED'
            }), 500

        if not os.path.exists(output_path):
            logger.error(f"Output file not found: {output_path}")
            return jsonify({
                'error': 'Output not generated',
                'details': f'Output file was not created: {output_path}',
                'code': 'OUTPUT_NOT_FOUND'
            }), 500

        # Create a temporary copy for streaming
        temp_fd, temp_path = tempfile.mkstemp(suffix='.mp4')
        try:
            shutil.copy2(output_path, temp_path)
            def generate():
                with open(temp_path, 'rb') as f:
                    yield from f
                # Cleanup
                try:
                    os.close(temp_fd)
                    os.remove(temp_path)
                    os.remove(media_path)
                    os.remove(audio_path)
                    os.remove(output_path)
                    logger.debug(f"Cleaned up files: {media_path}, {audio_path}, {output_path}, {temp_path}")
                except Exception as e:
                    logger.warning(f"Failed to clean up files: {str(e)}")

            response = Response(
                generate(),
                mimetype='video/mp4',
                headers={
                    'Content-Disposition': f'attachment; filename=ai_avatar_{unique_id}.mp4',
                    'Cache-Control': 'no-cache'
                }
            )
            return response
        except Exception as e:
            os.close(temp_fd)
            os.remove(temp_path)
            logger.error(f"Failed to create temporary file: {str(e)}")
            return jsonify({
                'error': 'Internal error',
                'details': f'Failed to stream output: {str(e)}',
                'code': 'STREAMING_ERROR'
            }), 500

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'error': 'Internal error',
            'details': str(e),
            'code': 'INTERNAL_ERROR'
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv("PORT", 5000)))