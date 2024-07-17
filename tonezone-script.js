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

    // Add touch events for mobile
    playPauseBtn.addEventListener('touchstart', togglePlayPause);
    prevBtn.addEventListener('touchstart', playPreviousSong);
    nextBtn.addEventListener('touchstart', playNextSong);
    progressContainer.addEventListener('touchstart', seek);
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

    drawVisualizer();
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
    document.getElementById('artistName').textContent = 'Joachim Rayski'; // Assuming all songs are by the same artist
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
    const clickX = e.type.includes('touch') ? e.touches[0].clientX - this.getBoundingClientRect().left : e.offsetX;
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

function drawVisualizer() {
    const canvas = visualizer;
    const ctx = canvas.getContext('2d');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    function renderFrame() {
        requestAnimationFrame(renderFrame);

        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / dataArray.length) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            barHeight = dataArray[i] / 2;

            const hue = i * 2;
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    renderFrame();
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

// Preload album art
function preloadAlbumArt() {
    const img = new Image();
    img.src = 'placeholder-album-art.jpg';
}

preloadAlbumArt();

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