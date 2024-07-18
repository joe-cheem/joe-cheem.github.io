let audioPlayer, playPauseBtn, prevBtn, nextBtn, progressContainer, progress, timeDisplay, volumeSlider, songList, visualizer;
let audioContext, analyser, source, dataArray;
let songs = [];
let currentSongIndex = 0;
let isPlaying = false;

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

function setupEventListeners() {
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPreviousSong);
    nextBtn.addEventListener('click', playNextSong);
    progressContainer.addEventListener('mousedown', seekStart);
    progressContainer.addEventListener('touchstart', seekStart, { passive: false });
    volumeSlider.addEventListener('input', adjustVolume);
    volumeSlider.addEventListener('touchstart', preventScroll, { passive: false });
    volumeSlider.addEventListener('touchmove', preventScroll, { passive: false });
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', playNextSong);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Add these new event listeners for mobile volume control
    volumeSlider.addEventListener('touchstart', handleVolumeTouch);
    volumeSlider.addEventListener('touchmove', handleVolumeTouch);
}

function handleVolumeTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const sliderRect = volumeSlider.getBoundingClientRect();
    const newVolume = (touch.clientX - sliderRect.left) / sliderRect.width;
    audioPlayer.volume = Math.max(0, Math.min(1, newVolume));
    volumeSlider.value = audioPlayer.volume;
}

function preventScroll(e) {
    e.preventDefault();
}

function seekStart(e) {
    e.preventDefault();
    const seekHandler = (e) => seek(e);
    const seekEndHandler = () => {
        document.removeEventListener('mousemove', seekHandler);
        document.removeEventListener('mouseup', seekEndHandler);
        document.removeEventListener('touchmove', seekHandler);
        document.removeEventListener('touchend', seekEndHandler);
        if (isPlaying) {
            audioPlayer.play();
        }
    };

    document.addEventListener('mousemove', seekHandler);
    document.addEventListener('mouseup', seekEndHandler);
    document.addEventListener('touchmove', seekHandler, { passive: false });
    document.addEventListener('touchend', seekEndHandler);

    seek(e);
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

function playSong(index) {
    currentSongIndex = index;
    audioPlayer.src = songs[index].file;
    audioPlayer.play()
        .then(() => {
            playPauseBtn.textContent = '❚❚';
            updateActiveSong();
            if (!audioContext) {
                initAudioContext();
            }
        })
        .catch(e => console.error('Error playing audio:', e));
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

function togglePlayPause() {
    if (audioPlayer.paused) {
        audioPlayer.play()
            .then(() => {
                isPlaying = true;
                playPauseBtn.textContent = '❚❚';
                if (!audioContext) {
                    initAudioContext();
                }
            })
            .catch(e => console.error('Error resuming playback:', e));
    } else {
        audioPlayer.pause();
        isPlaying = false;
        playPauseBtn.textContent = '▶';
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
    const duration = audioPlayer.duration;
    const currentTime = audioPlayer.currentTime;
    if (duration > 0) {
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    }
}

function seek(e) {
    const progressRect = progressContainer.getBoundingClientRect();
    const seekPosition = (e.clientX || e.touches[0].clientX) - progressRect.left;
    const seekPercentage = seekPosition / progressRect.width;
    audioPlayer.currentTime = seekPercentage * audioPlayer.duration;
    updateProgress();
}

function adjustVolume() {
    audioPlayer.volume = volumeSlider.value;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function initAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaElementSource(audioPlayer);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    setupVisualizer();
}

function setupVisualizer() {
    const canvas = visualizer;
    const ctx = canvas.getContext('2d');

    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);

        analyser.getByteFrequencyData(dataArray);

        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / dataArray.length) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            barHeight = dataArray[i] / 2;

            // Create a gradient from deep purple to light purple
            const gradient = ctx.createLinearGradient(0, HEIGHT, 0, HEIGHT - barHeight);
            gradient.addColorStop(0, '#4B0082');  // Deep purple
            gradient.addColorStop(1, '#8A2BE2');  // Light purple

            ctx.fillStyle = gradient;
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    drawVisualizer();
}

function handleResize() {
    resizeCanvas();
}

function handleOrientationChange() {
    setTimeout(() => {
        resizeCanvas();
    }, 100);
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = visualizer.getBoundingClientRect();
    visualizer.width = rect.width * dpr;
    visualizer.height = rect.height * dpr;
    const ctx = visualizer.getContext('2d');
    ctx.scale(dpr, dpr);
}

// Note: The setupNavbarBehavior function has been removed as it's now handled in common.js