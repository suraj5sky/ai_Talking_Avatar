document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const imageUpload = document.getElementById('imageUpload');
  const videoUpload = document.getElementById('videoUpload');
  const audioUpload1 = document.getElementById('audioUpload1');
  const audioUpload2 = document.getElementById('audioUpload2');
  const imagePreview = document.getElementById('imagePreview');
  const videoPreview = document.getElementById('videoPreview');
  const imageName = document.getElementById('imageName');
  const videoName = document.getElementById('videoName');
  const audioName1 = document.getElementById('audioName1');
  const audioName2 = document.getElementById('audioName2');
  const generateBtn = document.getElementById('generateBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('spinner');
  const status = document.getElementById('status');
  const result = document.getElementById('result');
  const video = document.getElementById('outputVideo');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const shareBtn = document.getElementById('shareBtn');
  const modeBtns = document.querySelectorAll('.mode-btn');
  const uploadModes = document.querySelectorAll('.upload-mode');
  const advancedOptions = document.querySelector('.advanced-options');
  const toggleBtn = document.querySelector('.toggle-btn');
  const optionContent = document.querySelector('.option-content');
  const navToggle = document.querySelector('.nav-toggle');
  const navbar = document.querySelector('.navbar');
  const downloadModal = document.getElementById('downloadModal');
  const modalClose = document.querySelectorAll('.modal-close');
  const modalDownloadLink = document.getElementById('modalDownloadLink');
  const modalFileName = document.getElementById('modalFileName');
  const themeToggle = document.querySelector('.theme-toggle');
  const progressBar = document.querySelector('.progress-bar');
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-text');
  const userToggle = document.querySelector('.user-toggle');
  const userDropdown = document.querySelector('.user-dropdown');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const authModal = document.getElementById('authModal');
  const authForm = document.getElementById('authForm');
  const authTitle = document.getElementById('authTitle');
  const authSwitch = document.getElementById('authSwitch');
const switchToSignup = document.getElementById('switchToSignup');																   
  const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
  const cookiesConsent = document.getElementById('cookiesConsent');
  const acceptCookies = document.getElementById('acceptCookies');
  const declineCookies = document.getElementById('declineCookies');
  const tourBtn = document.querySelector('.tour-btn');
  const confettiCanvas = document.getElementById('confetti-canvas');

  // Typewriter effect for tagline
  const tagline = document.querySelector('.app-header .typewriter');
  const taglineText = "Transform your media into lifelike animated characters with AI";
  let i = 0;
  function typeWriter() {
    if (i < taglineText.length) {
      tagline.textContent += taglineText.charAt(i);
      i++;
      setTimeout(typeWriter, 30);
    }
  }
  typeWriter();

  // Initialize Particles.js
  particlesJS('particles-js', {
    particles: {
      number: { value: window.innerWidth < 768 ? 20 : 40, density: { enable: true, value_area: 800 } },
      color: { value: ['#6a11cb', '#00ddeb', '#ffffff'] },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 1.5, direction: 'none', random: true }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
      modes: { repulse: { distance: 80 }, push: { particles_nb: 3 } }
    },
    retina_detect: true
  });

  // Initialize waveform visualizations
  function initWaveform(containerId, barCount = 20) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('div');
      bar.classList.add('wave-bar');
      bar.style.height = `${Math.random() * 35 + 12}px`;
      bar.style.animationDelay = `${i * 0.1}s`;
      container.appendChild(bar);
    }
  }
  initWaveform('audioWaveform1');
  initWaveform('audioWaveform2');

  // Animate waveform bars
  function animateWaveform(containerId) {
    const bars = document.getElementById(containerId).querySelectorAll('.wave-bar');
    bars.forEach(bar => {
      bar.style.height = `${Math.random() * 55 + 12}px`;
      bar.style.animation = 'wave 1s infinite ease-in-out';
      bar.style.animationDelay = `${Math.random() * 0.5}s`;
    });
  }

  // File upload handling with validation and drag-and-drop
  function handleFileUpload(input, preview, nameDisplay, type) {
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      if (!validateFile(file, type, type === 'video' ? 20 : 10)) return;
      nameDisplay.textContent = file.name;
      const card = input.closest('.upload-card');
      card.classList.add('uploaded');
      if (type === 'image' && preview) {
        const reader = new FileReader();
        reader.onload = () => {
          preview.style.backgroundImage = `url(${reader.result})`;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else if (type === 'video' && preview) {
        const url = URL.createObjectURL(file);
        preview.src = url;
        preview.style.display = 'block';
      } else if (type === 'audio') {
        animateWaveform(input.id === 'audioUpload1' ? 'audioWaveform1' : 'audioWaveform2');
      }
    });

    const label = input.nextElementSibling;
    label.addEventListener('dragover', (e) => {
      e.preventDefault();
      label.classList.add('drag-over');
    });
    label.addEventListener('dragleave', () => label.classList.remove('drag-over'));
    label.addEventListener('drop', (e) => {
      e.preventDefault();
      label.classList.remove('drag-over');
      input.files = e.dataTransfer.files;
      input.dispatchEvent(new Event('change'));
    });
  }

  function validateFile(file, type, maxSizeMB) {
    const maxSize = maxSizeMB * 1024 * 1024;
    if (!file) return false;
    if (file.size > maxSize) {
      showStatus(`File too large! Max ${maxSizeMB}MB`, 'error');
      return false;
    }
    if (type === 'image' && !file.type.match('image.*')) {
      showStatus('Please upload a valid image file (JPEG, PNG, WEBP)', 'error');
      return false;
    }
    if (type === 'video' && !['video/mp4', 'video/quicktime', 'video/x-msvideo'].includes(file.type)) {
      showStatus('Please upload a valid video file (MP4, MOV, AVI)', 'error');
      return false;
    }
    if (type === 'audio' && !file.type.match('audio.*')) {
      showStatus('Please upload a valid audio file (MP3, WAV, OGG)', 'error');
      return false;
    }
    return true;
  }

  handleFileUpload(imageUpload, imagePreview, imageName, 'image');
  handleFileUpload(videoUpload, videoPreview, videoName, 'video');
  handleFileUpload(audioUpload1, null, audioName1, 'audio');
  handleFileUpload(audioUpload2, null, audioName2, 'audio');

  // Mode switching
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      uploadModes.forEach(m => m.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.mode}Mode`).classList.add('active');
    });
  });

  // Advanced options toggle
  toggleBtn.addEventListener('click', () => {
    optionContent.classList.toggle('active');
  });

  // Navbar toggle for mobile
  navToggle.addEventListener('click', () => {
    navbar.classList.toggle('expanded');
  });

  // Smooth scrolling with active link highlighting
  const scrollLinks = document.querySelectorAll('.scroll-link');
  scrollLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      target.scrollIntoView({ behavior: 'smooth' });
      scrollLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Debounced scroll for performance
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const sections = document.querySelectorAll('section, .content-wrapper');
        let current = '';
        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          if (window.scrollY >= sectionTop - 60) {
            current = section.getAttribute('id');
          }
        });
        scrollLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
          }
        });
        ticking = false;
      });
      ticking = true;
    }
  });

  // Theme toggle with persistence
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    const isLight = document.documentElement.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
  });
  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.classList.add('light');
    themeToggle.querySelector('i').className = 'fas fa-sun';
  }

  // User menu with accessibility
  userToggle.addEventListener('click', () => {
    userDropdown.classList.toggle('hidden');
    const isExpanded = !userDropdown.classList.contains('hidden');
    userToggle.setAttribute('aria-expanded', isExpanded);
  });

  userToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      userToggle.click();
    }
  });

  document.addEventListener('click', (e) => {
    if (!userToggle.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.add('hidden');
      userToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Modal handling with focus trapping
  function showModal(modal) {
    modal.classList.remove('hidden');
    const firstInput = modal.querySelector('input');
    if (firstInput) firstInput.focus();
    trapFocus(modal);
  }

  function hideModal(modal) {
    modal.classList.add('hidden');
    document.removeEventListener('keydown', modal.focusTrap);
  }

  function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modal.focusTrap = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      } else if (e.key === 'Escape') {
        hideModal(modal);
      }
    };

    document.addEventListener('keydown', modal.focusTrap);
  }

  modalClose.forEach(btn => {
    btn.addEventListener('click', () => {
      hideModal(btn.closest('.modal'));
    });
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideModal(modal);
      }
    });
  });

  // Auth modal handling
  let isSignup = false;
  loginBtn.addEventListener('click', () => {
    isSignup = false;
    authTitle.textContent = 'Login';
    authForm.querySelector('button').textContent = 'Login';
    confirmPasswordGroup.classList.add('hidden');
    authSwitch.innerHTML = `Don't have an account? <a href="#" id="switchToSignup">Sign Up</a>`;
    showModal(authModal);
  });

  signupBtn.addEventListener('click', () => {
    isSignup = true;
    authTitle.textContent = 'Sign Up';
    authForm.querySelector('button').textContent = 'Sign Up';
    confirmPasswordGroup.classList.remove('hidden');
    authSwitch.innerHTML = `Already have an account? <a href="#" id="switchToLogin">Login</a>`;
    showModal(authModal);
  });

  authModal.addEventListener('click', (e) => {
    if (e.target.id === 'switchToSignup') {
      e.preventDefault();
      isSignup = true;
      authTitle.textContent = 'Sign Up';
      authForm.querySelector('button').textContent = 'Sign Up';
      confirmPasswordGroup.classList.remove('hidden');
      authSwitch.innerHTML = `Already have an account? <a href="#" id="switchToLogin">Login</a>`;
    } else if (e.target.id === 'switchToLogin') {
      e.preventDefault();
      isSignup = false;
      authTitle.textContent = 'Login';
      authForm.querySelector('button').textContent = 'Login';
      confirmPasswordGroup.classList.add('hidden');
      authSwitch.innerHTML = `Don't have an account? <a href="#" id="switchToSignup">Sign Up</a>`;
    }
  });

  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (isSignup) {
      const confirmPassword = document.getElementById('confirmPassword').value;
      if (password !== confirmPassword) {
        showStatus('Passwords do not match!', 'error');
        return;
      }
    }
    showStatus(`${isSignup ? 'Sign Up' : 'Login'} successful! (Demo)`, 'success');
    hideModal(authModal);
  });

  // Cookies consent with animation and persistence
  if (!localStorage.getItem('cookiesConsent')) {
    cookiesConsent.classList.remove('hidden');
  }
  acceptCookies.addEventListener('click', () => {
    localStorage.setItem('cookiesConsent', 'accepted');
    cookiesConsent.classList.add('hidden');
    setTimeout(() => {
      cookiesConsent.style.display = 'none';
    }, 300);
  });
  declineCookies.addEventListener('click', () => {
    localStorage.setItem('cookiesConsent', 'declined');
    cookiesConsent.classList.add('hidden');
    setTimeout(() => {
      cookiesConsent.style.display = 'none';
    }, 300);
  });

  // Legal pages handling
  document.querySelectorAll('a[href="/privacy"], a[href="/terms"], a[href="/cookies"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const type = link.getAttribute('href').substring(1);
      const template = document.getElementById(`${type}Template`).content.cloneNode(true);
      const modal = document.createElement('div');
      modal.className = 'modal';
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      modalContent.appendChild(template);
      modalContent.innerHTML += '<span class="modal-close" aria-label="Close modal">×</span>';
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      showModal(modal);
      modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
      modal.addEventListener('click', (ev) => {
        if (ev.target === modal) modal.remove();
      });
    });
  });

  // Onboarding tour
  const tourSteps = [
    { element: '.navbar', message: 'Navigate through the app using the sidebar.' },
    { element: '.upload-sections', message: 'Upload your image or video and audio files here.' },
    { element: '.generate-btn', message: 'Click to generate your AI avatar video.' },
    { element: '.pricing-section', message: 'Choose a plan that fits your needs.' }
  ];
  let currentTourStep = 0;
  function showTourStep(stepIndex) {
    if (stepIndex >= tourSteps.length) {
      endTour();
      return;
    }
    const step = tourSteps[stepIndex];
    const element = document.querySelector(step.element);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth' });
    document.querySelectorAll('.tour-popup').forEach(p => p.remove());
    document.querySelectorAll('.tour-highlight').forEach(e => e.classList.remove('tour-highlight'));
    const tourPopup = document.createElement('div');
    tourPopup.className = 'tour-popup';
    tourPopup.innerHTML = `
      <p>${step.message}</p>
      <button class="tour-next">Next</button>
      <button class="tour-skip">Skip</button>
    `;
    document.body.appendChild(tourPopup);
    const rect = element.getBoundingClientRect();
    tourPopup.style.top = `${rect.bottom + window.scrollY + 10}px`;
    tourPopup.style.left = `${rect.left + rect.width / 2 - tourPopup.offsetWidth / 2}px`;
    element.classList.add('tour-highlight');
    tourPopup.querySelector('.tour-next').addEventListener('click', () => {
      tourPopup.remove();
      element.classList.remove('tour-highlight');
      showTourStep(++currentTourStep);
    });
    tourPopup.querySelector('.tour-skip').addEventListener('click', endTour);
  }
  function endTour() {
    document.querySelectorAll('.tour-popup').forEach(p => p.remove());
    document.querySelectorAll('.tour-highlight').forEach(e => e.classList.remove('tour-highlight'));
    currentTourStep = 0;
    localStorage.setItem('tourCompleted', 'true');
  }
  if (!localStorage.getItem('tourCompleted')) {
    tourBtn.addEventListener('click', () => showTourStep(currentTourStep));
  } else {
    tourBtn.style.display = 'none';
  }

  // Generate button with API integration
  generateBtn.addEventListener('click', async () => {
    const activeMode = document.querySelector('.mode-btn.active').dataset.mode;
    let mediaFile, audioFile;
    if (activeMode === 'image') {
      mediaFile = imageUpload.files[0];
      audioFile = audioUpload1.files[0];
    } else {
      mediaFile = videoUpload.files[0];
      audioFile = audioUpload2.files[0];
    }

    if (!mediaFile || !audioFile) {
      showStatus('Please upload both media and audio files', 'error');
      return;
    }

    if (!validateFile(mediaFile, activeMode, activeMode === 'video' ? 20 : 10)) return;
    if (!validateFile(audioFile, 'audio', 10)) return;

    const formData = new FormData();
    formData.append('media', mediaFile);
    formData.append('audio', audioFile);
    formData.append('mode', activeMode);
    formData.append('resolution', document.getElementById('resolution').value);
    formData.append('quality', document.getElementById('quality').value);
    formData.append('background', document.getElementById('background').value);

    btnText.textContent = 'Processing...';
    spinner.classList.remove('hidden');
    generateBtn.disabled = true;
    showStatus('Generating your AI avatar... This may take a moment', 'processing');

    progressBar.classList.remove('hidden');
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${progress}%`;
      if (progress >= 100) clearInterval(progressInterval);
    }, 1000);

    const videoLoading = document.querySelector('.video-loading');
    videoLoading.classList.remove('hidden');

    try {
      const response = await fetch('/api/lipsync', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        let userMessage = 'Failed to generate video';
        if (errorData.code === 'PROCESSING_FAILED') {
          const wav2lipError = errorData.details.includes('Wav2Lip Error:') 
            ? errorData.details.split('Wav2Lip Error:')[1].trim()
            : errorData.details;
          userMessage = `AI Processing Error: ${wav2lipError}`;
        } else {
          userMessage = errorData.details || userMessage;
        }
        throw new Error(userMessage);
      }

      const videoBlob = await response.blob();
      if (!videoBlob.type.startsWith('video/')) {
        throw new Error('Server returned invalid video file');
      }

      const videoUrl = URL.createObjectURL(videoBlob);
      video.innerHTML = '';
      video.src = videoUrl;
      video.controls = true;
      video.muted = true;

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `ai-avatar-${timestamp}.mp4`;
      modalDownloadLink.href = videoUrl;
      modalDownloadLink.download = fileName;
      modalFileName.textContent = fileName;

      videoLoading.classList.add('hidden');
      result.classList.remove('hidden');
      showStatus('Success! Your AI avatar video is ready', 'success');

      video.play().catch(e => {
        console.log('Autoplay prevented, showing controls');
        video.controls = true;
      });

      video.onloadeddata = () => {
        console.log('Video loaded successfully');
        triggerConfetti();
      };

      video.onerror = () => {
        console.error('Video playback error');
        showStatus('Video generated but cannot be played', 'error');
      };

      result.scrollIntoView({ behavior: 'smooth' });
      progressBar.classList.add('hidden');

    } catch (error) {
      console.error('Generation error:', error);
      status.innerHTML = `
        <div class="error-box">
          <i class="fas fa-exclamation-triangle"></i>
          <h4>Generation Failed</h4>
          <p>${error.message}</p>
          ${error.message.includes('video') ? 
            '<p class="solution">Try converting your video to MP4 format</p>' : 
          error.message.includes('image') ? 
            '<p class="solution">Try using a higher quality image</p>' : ''}
          <button class="retry-btn">
            <i class="fas fa-sync-alt"></i> Try Again
          </button>
        </div>
      `;
      status.classList.add('error');
      status.querySelector('.retry-btn').addEventListener('click', () => {
        status.innerHTML = '';
        status.classList.remove('error');
        generateBtn.click();
      });
      videoLoading.classList.add('hidden');
      progressBar.classList.add('hidden');
    } finally {
      btnText.textContent = 'Generate AI Avatar';
      spinner.classList.add('hidden');
      generateBtn.disabled = false;
    }
  });

  // Download button
  downloadBtn.addEventListener('click', () => {
    showModal(downloadModal);
  });

  // Reset button
  resetBtn.addEventListener('click', () => {
    imageUpload.value = '';
    videoUpload.value = '';
    audioUpload1.value = '';
    audioUpload2.value = '';
    imageName.textContent = 'No file selected';
    videoName.textContent = 'No file selected';
    audioName1.textContent = 'No file selected';
    audioName2.textContent = 'No file selected';
    imagePreview.style.display = 'none';
    imagePreview.style.backgroundImage = '';
    videoPreview.src = '';
    videoPreview.style.display = 'none';
    video.src = '';
    result.classList.add('hidden');
    showStatus('', '');
    hideModal(downloadModal);
    document.querySelectorAll('.upload-card').forEach(card => card.classList.remove('uploaded'));
  });

  // Share button with thumbnail
  shareBtn.addEventListener('click', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const thumbnail = canvas.toDataURL('image/jpeg');
    const thumbnailBlob = await (await fetch(thumbnail)).blob();
    const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' });

    if (navigator.share) {
      navigator.share({
        title: 'My AI Avatar Video',
        text: 'Check out this AI-generated avatar video I created!',
        url: modalDownloadLink.href,
        files: [thumbnailFile]
      }).catch(err => {
        console.log('Error sharing:', err);
        showStatus('Sharing failed. Try downloading instead.', 'error');
      });
    } else {
      const shareUrl = `${window.location.origin}/share?video=${encodeURIComponent(modalDownloadLink.href)}`;
      prompt('Copy this link to share:', shareUrl);
    }
  });

  // Confetti effect
  let animationId;
  function triggerConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    const pieces = [];
    const colors = ['#6a11cb', '#00ddeb', '#F472B6', '#4ADE80', '#FBBF24'];

    for (let i = 0; i < (window.innerWidth < 768 ? 100 : 200); i++) {
      pieces.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        r: Math.random() * 4 + 2,
        d: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngle: Math.random() * 0.08,
        tiltAngleIncrement: Math.random() * 0.06
      });
    }

    function animate() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      pieces.forEach((p, i) => {
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt, p.y);
        ctx.lineTo(p.x + p.tilt + p.r * 2, p.y);
        ctx.stroke();
        p.tiltAngle += p.tiltAngleIncrement;
        p.y += (Math.cos(p.d) + 2 + p.r / 2) / 2;
        p.tilt = Math.sin(p.tiltAngle) * 12;
        if (p.y > confettiCanvas.height) {
          pieces[i] = {
            x: Math.random() * confettiCanvas.width,
            y: -10,
            r: p.r,
            d: p.d,
            color: p.color,
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngle: p.tiltAngle,
            tiltAngleIncrement: p.tiltAngleIncrement
          };
        }
      });
      animationId = requestAnimationFrame(animate);
    }
    animate();

    setTimeout(() => {
      cancelAnimationFrame(animationId);
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }, 4000);
  }

  // Handle window resize for confetti canvas
  window.addEventListener('resize', () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  });

  // Helper function for status messages
  function showStatus(message, type) {
    status.textContent = message;
    status.className = 'status-message';
    if (type) {
      status.classList.add(type);
    }
  }
});