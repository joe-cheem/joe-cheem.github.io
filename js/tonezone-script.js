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

function seek(e) {
    const progressRect = progressContainer.getBoundingClientRect();
    const seekPosition = (e.clientX || e.touches[0].clientX) - progressRect.left;
    const seekPercentage = seekPosition / progressRect.width;
    audioPlayer.currentTime = seekPercentage * audioPlayer.duration;
    updateProgress();
}

// ... (keep other existing functions) ...

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

function adjustVolume() {
    audioPlayer.volume = volumeSlider.value;
}

// ... (keep other existing functions) ...

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

            ctx.fillStyle = 'rgb(255, 0, 0)';
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