let audioPlayer, playPauseBtn, prevBtn, nextBtn, progressContainer, progress, timeDisplay, volumeSlider, songList, visualizer, navbar;
let audioContext, analyser, source;
let songs = [];
let currentSongIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    audioPlayer = document.getElementById('audioPlayer');
    playPauseBtn = document.getElementById('playPauseBtn');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    progressContainer = document.getElementById('progressContainer');
    progress = document.getElementById('progress');
    timeDisplay = document.getElementById('timeDisplay');
    volumeSlider = document.getElementById('volumeSlider');
    songList = document.getElementById('songList');
    visualizer = document.getElementById('visualizer');
    navbar = document.getElementById('navbar');

    initializePlayer();
});

function initializePlayer() {
    fetch('music.json')
        .then(response => response.json())
        .then(data => {
            songs = data.map(filename => ({
                title: filename.replace('.mp3', ''),
                file: `music/${filename}`
            }));
            
            populateSongList();
            setupEventListeners();
            audioPlayer.src = songs[currentSongIndex].file;
            updateActiveSong();
        })
        .catch(error => console.error('Error loading music.json:', error));
}

// ... (keep the existing functions like populateSongList, setupEventListeners, initAudioContext, playSong, updateActiveSong, togglePlayPause, playPreviousSong, playNextSong, updateProgress, seek, adjustVolume, formatTime)

function setupVisualizer() {
    analyser.fftSize = 1024;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const ctx = visualizer.getContext('2d');
    const WIDTH = visualizer.width;
    const HEIGHT = visualizer.height;

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(138, 43, 226, 0.8)'; // Purple color

    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);

        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgba(13, 0, 21, 0.2)'; // Dark purple background
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.beginPath();
        ctx.moveTo(0, HEIGHT);

        const sliceWidth = WIDTH / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * HEIGHT / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.lineTo(WIDTH, HEIGHT / 2);
        ctx.stroke();

        // Add particles
        for (let i = 0; i < bufferLength; i += 10) {
            if (dataArray[i] > 200) {
                const size = Math.random() * 5 + 2;
                const x = Math.random() * WIDTH;
                const y = Math.random() * HEIGHT;
                ctx.fillStyle = `rgba(255, 215, 0, ${Math.random() * 0.5 + 0.5})`; // Gold color
                ctx.fillRect(x, y, size, size);
            }
        }
    }

    drawVisualizer();
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = visualizer.getBoundingClientRect();
    visualizer.width = rect.width * dpr;
    visualizer.height = rect.height * dpr;
    const ctx = visualizer.getContext('2d');
    ctx.scale(dpr, dpr);
}

// Add a function to create an immersive background
function createImmersiveBackground() {
    const container = document.createElement('div');
    container.id = 'immersive-background';
    document.body.prepend(container);

    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        container.appendChild(star);
    }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', createImmersiveBackground);

// Enable audio playback on mobile
document.body.addEventListener('touchstart', function() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}, false);

// Ensure the audio context is resumed on user interaction
document.addEventListener('click', function() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        audioPlayer.pause();
        playPauseBtn.textContent = '▶';
    }
});

// Navigation bar behavior
let lastScrollTop = 0;
const scrollThreshold = 100; // Adjust this value to change when the navbar starts hiding

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > scrollThreshold) {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }
    lastScrollTop = scrollTop;
});

// Show navbar on hover
navbar.addEventListener('mouseenter', () => {
    navbar.classList.remove('hidden');
});

// Hide navbar when clicking a link if below threshold
navbar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > scrollThreshold) {
            navbar.classList.add('hidden');
        }
    });
});