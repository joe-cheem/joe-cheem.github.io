let audioPlayer, playPauseBtn, prevBtn, nextBtn, progressContainer, progress, timeDisplay, volumeSlider, songList, visualizer;
let audioContext, analyser, source, dataArray;
let songs = [];
let currentSongIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    initializePlayer();
    loadSongs();
});

function initializePlayer() {
    audioPlayer = new Audio();
    playPauseBtn = document.getElementById('playPauseBtn');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    progressContainer = document.getElementById('progressContainer');
    progress = document.getElementById('progress');
    timeDisplay = document.getElementById('timeDisplay');
    volumeSlider = document.getElementById('volumeSlider');
    songList = document.getElementById('songList');
    visualizer = document.getElementById('visualizer');

    setupEventListeners();
    setupAudioContext();
}

function setupEventListeners() {
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPreviousSong);
    nextBtn.addEventListener('click', playNextSong);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', playNextSong);
    volumeSlider.addEventListener('input', adjustVolume);
    progressContainer.addEventListener('click', seek);
}

function setupAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaElementSource(audioPlayer);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    drawCircularVisualizer();
}

function loadSongs() {
    fetch('music.json')
        .then(response => response.json())
        .then(data => {
            songs = data.map(filename => ({
                title: filename.replace('.mp3', ''),
                file: `music/${filename}`
            }));
            populateSongList();
            if (songs.length > 0) {
                loadSong(0);
            }
        })
        .catch(error => console.error('Error loading music.json:', error));
}

function populateSongList() {
    songList.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = song.title;
        li.addEventListener('click', () => playSong(index));
        songList.appendChild(li);
    });
}

function loadSong(index) {
    currentSongIndex = index;
    audioPlayer.src = songs[index].file;
    document.getElementById('trackTitle').textContent = songs[index].title;
    updateActiveSong();
}

function playSong(index) {
    loadSong(index);
    audioPlayer.play()
        .then(() => {
            playPauseBtn.innerHTML = '&#10074;&#10074;';
        })
        .catch(error => console.error('Error playing audio:', error));
}

function togglePlayPause() {
    if (audioPlayer.paused) {
        audioPlayer.play()
            .then(() => {
                playPauseBtn.innerHTML = '&#10074;&#10074;';
            })
            .catch(error => console.error('Error playing audio:', error));
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '&#9658;';
    }
}

function playPreviousSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
}

function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
}

function updateProgress() {
    const { duration, currentTime } = audioPlayer;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
}

function seek(e) {
    const progressWidth = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (clickX / progressWidth) * duration;
}

function adjustVolume() {
    audioPlayer.volume = volumeSlider.value;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateActiveSong() {
    songList.querySelectorAll('li').forEach((li, index) => {
        if (index === currentSongIndex) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });
}

function drawCircularVisualizer() {
    const canvas = visualizer;
    const ctx = canvas.getContext('2d');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;
    const radius = Math.min(WIDTH, HEIGHT) / 2 - 10;

    function renderFrame() {
        requestAnimationFrame(renderFrame);

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        const barCount = dataArray.length;
        const barAngleStep = (2 * Math.PI) / barCount;

        for (let i = 0; i < barCount; i++) {
            const barHeight = dataArray[i] / 2;
            const angle = i * barAngleStep;

            const x1 = centerX + radius * Math.cos(angle);
            const y1 = centerY + radius * Math.sin(angle);
            const x2 = centerX + (radius + barHeight) * Math.cos(angle);
            const y2 = centerY + (radius + barHeight) * Math.sin(angle);

            const hue = i * (360 / barCount);
            ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    renderFrame();
}

// Handle audio context state for mobile devices
document.body.addEventListener('touchstart', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
});

// Add swipe gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
        playNextSong();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
        playPreviousSong();
    }
}

// Resize canvas on window resize
window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
    const canvas = visualizer;
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

// Update navbar behavior
const navbar = document.getElementById('navbar');
let lastScrollTop = 0;
const scrollThreshold = 100;

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > scrollThreshold && scrollTop > lastScrollTop) {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }
    lastScrollTop = scrollTop;
});

navbar.addEventListener('mouseenter', () => {
    navbar.classList.remove('hidden');
});

navbar.addEventListener('touchstart', () => {
    navbar.classList.remove('hidden');
});