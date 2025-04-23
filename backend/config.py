import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
    OUTPUT_FOLDER = os.path.join(basedir, 'outputs')
    ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'wav', 'mp3'}
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB limit