let audioPlayer, playPauseBtn, prevBtn, nextBtn, progressContainer, progress, timeDisplay, volumeSlider, songList, visualizer;
let songs = [];
let currentSongIndex = 0;
let audioContext, analyser, source, dataArray;
let animationId;

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
    progressContainer.addEventListener('click', seek);
    volumeSlider.addEventListener('input', adjustVolume);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', playNextSong);
    audioPlayer.addEventListener('play', () => {
        playPauseBtn.textContent = '❚❚';
        if (!audioContext) initializeVisualizer();
        startVisualizer();
    });
    audioPlayer.addEventListener('pause', () => {
        playPauseBtn.textContent = '▶';
        stopVisualizer();
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

function handleVisibilityChange() {
    if (document.hidden) {
        stopVisualizer();
    } else if (!audioPlayer.paused) {
        startVisualizer();
    }
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
    audioPlayer.play().catch(e => console.error('Error playing audio:', e));
    updateActiveSong();
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
        audioPlayer.play().catch(e => console.error('Error playing audio:', e));
    } else {
        audioPlayer.pause();
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
    const seekPercentage = (e.clientX - progressRect.left) / progressRect.width;
    audioPlayer.currentTime = seekPercentage * audioPlayer.duration;
}

function adjustVolume() {
    audioPlayer.volume = volumeSlider.value;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function initializeVisualizer() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaElementSource(audioPlayer);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    visualizer.innerHTML = '';
    for (let i = 0; i < bufferLength; i++) {
        const bar = document.createElement('div');
        bar.className = 'visualizer-bar';
        visualizer.appendChild(bar);
    }
}

function startVisualizer() {
    if (!audioContext) return;
    
    function updateVisualizer() {
        animationId = requestAnimationFrame(updateVisualizer);
        analyser.getByteFrequencyData(dataArray);

        const bars = visualizer.querySelectorAll('.visualizer-bar');
        bars.forEach((bar, index) => {
            const height = dataArray[index] / 255 * 100;
            bar.style.height = `${height}%`;
        });
    }

    updateVisualizer();
}

function stopVisualizer() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function handleResize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = visualizer.getBoundingClientRect();
    visualizer.width = rect.width * dpr;
    visualizer.height = rect.height * dpr;
}

window.addEventListener('resize', handleResize);
handleResize();