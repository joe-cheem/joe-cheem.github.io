let audioContext, analyser, source;
let audioElement, progressBar, timeDisplay, volumeSlider, songList;
let currentSongIndex = 0;
let songs = [];

document.addEventListener('DOMContentLoaded', init);

function init() {
    audioElement = new Audio();
    progressBar = document.getElementById('progress-bar');
    timeDisplay = document.getElementById('time-display');
    volumeSlider = document.getElementById('volume-slider');
    songList = document.getElementById('song-list');

    setupEventListeners();
    loadSongs();
    setupAudioContext();
}

function setupEventListeners() {
    document.getElementById('play-pause-button').addEventListener('click', togglePlayPause);
    document.getElementById('prev-button').addEventListener('click', playPreviousSong);
    document.getElementById('next-button').addEventListener('click', playNextSong);
    volumeSlider.addEventListener('input', updateVolume);
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', playNextSong);
}

function loadSongs() {
    fetch('music.json')
        .then(response => response.json())
        .then(data => {
            songs = data;
            updateSongList();
        })
        .catch(error => console.error('Error loading songs:', error));
}

function updateSongList() {
    songList.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = song.replace('.mp3', '');
        li.addEventListener('click', () => playSong(index));
        songList.appendChild(li);
    });
}

function playSong(index) {
    currentSongIndex = index;
    audioElement.src = `music/${songs[index]}`;
    audioElement.play();
    updatePlayPauseButton();
    updateCurrentSongTitle();
    updateActiveSong();
}

function togglePlayPause() {
    if (audioElement.paused) {
        audioElement.play();
    } else {
        audioElement.pause();
    }
    updatePlayPauseButton();
}

function updatePlayPauseButton() {
    const playPauseButton = document.getElementById('play-pause-button');
    playPauseButton.textContent = audioElement.paused ? 'Play' : 'Pause';
}

function playPreviousSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
}

function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
}

function updateVolume() {
    audioElement.volume = volumeSlider.value;
}

function updateProgress() {
    const progress = (audioElement.currentTime / audioElement.duration) * 100;
    progressBar.style.width = `${progress}%`;
    timeDisplay.textContent = `${formatTime(audioElement.currentTime)} / ${formatTime(audioElement.duration)}`;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateCurrentSongTitle() {
    const currentSongTitle = document.getElementById('current-song-title');
    currentSongTitle.textContent = songs[currentSongIndex].replace('.mp3', '');
}

function updateActiveSong() {
    const songItems = songList.getElementsByTagName('li');
    for (let i = 0; i < songItems.length; i++) {
        songItems[i].classList.remove('active');
    }
    songItems[currentSongIndex].classList.add('active');
}

function setupAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    visualize();
}

function visualize() {
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;

            ctx.fillStyle = `rgb(50, ${barHeight + 100}, 50)`;
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    draw();
}