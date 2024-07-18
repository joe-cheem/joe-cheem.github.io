let audioPlayer, playPauseBtn, prevBtn, nextBtn, progressContainer, progress, timeDisplay, volumeSlider, songList, visualizer;
let audioContext, analyser, source;
let songs = [];
let currentSongIndex = 0;
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
    handleResize();
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
            initializeAudioContext();
        })
        .catch(error => console.error('Error loading music.json:', error));

    // Hide volume controls on mobile devices
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        document.querySelector('.volume-control').style.display = 'none';
    }
}

function initializeAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source = audioContext.createMediaElementSource(audioPlayer);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
}

function setupEventListeners() {
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPreviousSong);
    nextBtn.addEventListener('click', playNextSong);
    progressContainer.addEventListener('click', seek);
    volumeSlider.addEventListener('input', adjustVolume);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', playNextSong);
    audioPlayer.addEventListener('play', startVisualizer);
    audioPlayer.addEventListener('pause', stopVisualizer);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => setTimeout(handleResize, 100));
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
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
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

function startVisualizer() {
    if (!animationId) {
        animateVisualizer();
    }
}

function stopVisualizer() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function animateVisualizer() {
    const ctx = visualizer.getContext('2d');
    const width = visualizer.width;
    const height = visualizer.height;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        animationId = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, width, height);

        const barWidth = width / bufferLength * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 255 * height;

            const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
            gradient.addColorStop(0, '#4B0082');  // Deep purple
            gradient.addColorStop(1, '#8A2BE2');  // Light purple

            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    draw();
}

function handleResize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = visualizer.getBoundingClientRect();
    visualizer.width = rect.width * dpr;
    visualizer.height = rect.height * dpr;
    const ctx = visualizer.getContext('2d');
    ctx.scale(dpr, dpr);
}