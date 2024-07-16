const navbar = document.getElementById('navbar');
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

const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progress');
const timeDisplay = document.getElementById('timeDisplay');
const volumeSlider = document.getElementById('volumeSlider');
const songDropdown = document.getElementById('songDropdown');
const songList = document.getElementById('songList');
const visualizer = document.getElementById('visualizer');

let songs = [];
let currentSongIndex = 0;

async function fetchSongs() {
    try {
        const response = await fetch('songs.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        songs = await response.json();
        initializePlayer();
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

function initializePlayer() {
    // Load the initial song
    loadSong(currentSongIndex);

    playPauseBtn.addEventListener('click', playPauseSong);
    prevBtn.addEventListener('click', playPrevSong);
    nextBtn.addEventListener('click', playNextSong);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    progressContainer.addEventListener('click', setProgress);
    volumeSlider.addEventListener('input', setVolume);
    audioPlayer.addEventListener('ended', playNextSong);

    // Initialize song list
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = song.title;
        li.addEventListener('click', () => handleSongClick(index));
        songList.appendChild(li);

        const option = document.createElement('option');
        option.value = index;
        option.textContent = song.title;
        songDropdown.appendChild(option);
    });

    songDropdown.addEventListener('change', (e) => {
        const index = parseInt(e.target.value);
        handleSongClick(index);
    });
}

function loadSong(index) {
    audioPlayer.src = songs[index].url;
    audioPlayer.load();
    updateActiveSong();
}

function playPauseSong() {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.textContent = '⏸';
    } else {
        audioPlayer.pause();
        playPauseBtn.textContent = '▶';
    }
}

function playPrevSong() {
    currentSongIndex = (currentSongIndex > 0) ? currentSongIndex - 1 : songs.length - 1;
    loadSong(currentSongIndex);
    audioPlayer.play();
}

function playNextSong() {
    currentSongIndex = (currentSongIndex < songs.length - 1) ? currentSongIndex + 1 : 0;
    loadSong(currentSongIndex);
    audioPlayer.play();
}

function updateProgress() {
    const { duration, currentTime } = audioPlayer;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;

    const formatTime = time => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (clickX / width) * duration;
}

function setVolume() {
    audioPlayer.volume = volumeSlider.value;
}

function updateActiveSong() {
    const songItems = songList.getElementsByTagName('li');
    for (let i = 0; i < songItems.length; i++) {
        songItems[i].classList.remove('active');
    }
    songItems[currentSongIndex].classList.add('active');
    songDropdown.value = currentSongIndex;
}

function handleSongClick(index) {
    currentSongIndex = index;
    loadSong(currentSongIndex);
    audioPlayer.play();
}

// Visualizer setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audioPlayer);
source.connect(analyser);
analyser.connect(audioContext.destination);
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

const canvasContext = visualizer.getContext('2d');

function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    canvasContext.fillStyle = 'rgba(0, 0, 0, 0.1)';
    canvasContext.fillRect(0, 0, visualizer.width, visualizer.height);

    const barWidth = (visualizer.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        const r = barHeight + 25 * (i / bufferLength);
        const g = 250 * (i / bufferLength);
        const b = 50;

        canvasContext.fillStyle = `rgb(${r},${g},${b})`;
        canvasContext.fillRect(x, visualizer.height - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
    }
}

draw();

// Fetch songs from the JSON file when the page loads
fetchSongs();
