# AI Avatar Talking

AI Avatar Talking is a web application that transforms images or videos combined with audio into lifelike animated avatar videos using AI-powered lip-sync technology. Users can upload media files, customize settings, and generate talking avatars with a user-friendly interface. The application features a responsive design, accessibility enhancements, and an onboarding tour to guide new users.

## Features

- **Media Uploads**: Upload images (JPEG, PNG, WEBP) or videos (MP4, MOV, AVI) and audio files (MP3, WAV, OGG) with drag-and-drop support.
- **Mode Switching**: Choose between Image + Audio or Video + Audio modes for avatar generation.
- **AI Video Generation**: Generate lip-synced videos via a backend API (`/api/lipsync`) with customizable resolution, quality, and background settings.
- **Progress Feedback**: Displays a progress bar during video generation with confetti animation on success.
- **Error Handling**: Detailed error messages for API failures (e.g., Wav2Lip errors) with retry options and solution suggestions.
- **Sharing**: Share generated videos with a thumbnail via Web Share API or a fallback URL.
- **Accessibility**: Keyboard navigation, focus trapping in modals, and ARIA attributes for user menu.
- **Responsive Design**: Mobile-friendly interface with a collapsible navbar and optimized animations.
- **Onboarding Tour**: Guided tour highlighting key features (navbar, uploads, generate button, pricing).
- **Cookies Consent**: Animated consent popup with localStorage persistence.
- **Theme Toggle**: Switch between dark and light themes with localStorage persistence.
- **Legal Pages**: Modals for privacy policy, terms of service, and cookies policy.
- **Animations**: Typewriter effect for tagline, waveform visualizations for audio, and particle background.

## Prerequisites

- **Python 3.8+**: For running the backend server.
- **Node.js** (optional): For frontend development or additional tooling.
- **Git**: For cloning the repository.
- **Modern Web Browser**: Chrome, Firefox, or Edge for optimal performance.
- **Backend Dependencies**: Ensure the backend API (`/api/lipsync`) is configured with Wav2Lip or similar AI models.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/ai-avatar-talking.git
   cd ai-avatar-talking
   ```

2. **Set Up the Backend**:
   - Navigate to the `backend` directory:
     ```bash
     cd backend
     ```
   - Create a virtual environment and activate it:
     ```bash
     python -m venv venv
     source venv/bin/activate  # On Windows: venv\Scripts\activate
     ```
   - Install backend dependencies (e.g., Flask, Wav2Lip dependencies):
     ```bash
     pip install -r requirements.txt
     ```
   - Configure the `/api/lipsync` endpoint with your AI model (e.g., Wav2Lip). Update `app.py` with necessary configurations.

3. **Set Up the Frontend**:
   - The frontend is served from the `frontend` directory and requires no additional setup for static files.
   - Ensure `index.html`, `style.css`, and `script.js` are in the `frontend` directory.

4. **Install External Dependencies**:
   - The frontend uses CDN-hosted libraries (Particles.js, Font Awesome). No local installation is needed.
   - Ensure internet access for CDN resources or host them locally if offline.

## Usage

1. **Run the Backend Server**:
   - From the project root:
     ```bash
     cd backend
     python app.py
     ```
   - The server will start at `http://localhost:5000`.

2. **Access the Application**:
   - Open a browser and navigate to `http://localhost:5000`.
   - The frontend will load from the `frontend` directory, served by the Flask backend.

3. **Generate an AI Avatar**:
   - Select a mode (Image + Audio or Video + Audio).
   - Upload an image/video and an audio file (max 10MB for images/audio, 20MB for videos).
   - Customize advanced options (resolution, quality, background).
   - Click "Generate AI Avatar" to process the files via the backend API.
   - View the generated video, download it, or share it with a thumbnail.

4. **Explore Features**:
   - Toggle between light and dark themes.
   - Use the onboarding tour (click the tour button) to learn about key features.
   - Access login/signup modals or legal pages (privacy, terms, cookies).
   - Test accessibility with keyboard navigation (Tab, Enter, Space).

## Project Structure

```
ai-avatar-talking/
├── backend/
│   ├── app.py              # Flask backend with /api/lipsync endpoint
│   ├── requirements.txt    # Backend dependencies
│   └── venv/              # Virtual environment
├── frontend/
│   ├── index.html         # Main HTML file
│   ├── style.css          # CSS styles
│   └── script.js          # JavaScript logic
├── README.md              # Project documentation
└── LICENSE                # License file (optional)
```

## Technologies Used

- **Frontend**:
  - HTML5, CSS3, JavaScript (ES6+)
  - Particles.js (via CDN) for background animation
  - Font Awesome (via CDN) for icons
  - Custom animations (confetti, waveform, typewriter)
- **Backend**:
  - Python (Flask)
  - Wav2Lip or similar AI model for lip-sync (configured in `app.py`)
- **Tools**:
  - Git for version control
  - Virtualenv for Python environment management

## Contributing

1. **Fork the Repository**:
   ```bash
   git clone https://github.com/your-username/ai-avatar-talking.git
   ```

2. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make Changes**:
   - Update frontend (`index.html`, `style.css`, `script.js`) or backend (`app.py`).
   - Ensure code follows existing style (e.g., consistent indentation, comments).

4. **Test Changes**:
   - Run the application locally and test all features.
   - Check for console errors in the browser (F12 > Console).

5. **Submit a Pull Request**:
   - Push your branch:
     ```bash
     git push origin feature/your-feature
     ```
   - Open a pull request on GitHub with a clear description of changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, contact [your-email@example.com] or open an issue on GitHub.