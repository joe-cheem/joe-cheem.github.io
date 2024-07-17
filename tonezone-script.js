let audioPlayer, playPauseBtn, prevBtn, nextBtn, progressContainer, progress, timeDisplay, volumeSlider, songList, visualizer, navbar;
let audioContext, analyser, source, dataArray;
let songs = [];
let currentSongIndex = 0;
let isMobile = false;

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

    detectMobileDevice();
    initializePlayer();
    createImmersiveBackground();
});

function detectMobileDevice() {
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.body.classList.add('mobile-device');
    }
}

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
            if (isMobile) {
                setupMobileControls();
            }
        })
        .catch(error => console.error('Error loading music.json:', error));
}

function setupEventListeners() {
    if (isMobile) {
        playPauseBtn.addEventListener('touchstart', togglePlayPause);
        prevBtn.addEventListener('touchstart', playPreviousSong);
        nextBtn.addEventListener('touchstart', playNextSong);
        progressContainer.addEventListener('touchstart', seekStart);
        progressContainer.addEventListener('touchmove', seekMove);
        progressContainer.addEventListener('touchend', seekEnd);
    } else {
        playPauseBtn.addEventListener('click', togglePlayPause);
        prevBtn.addEventListener('click', playPreviousSong);
        nextBtn.addEventListener('click', playNextSong);
        progressContainer.addEventListener('click', seek);
        volumeSlider.addEventListener('input', adjustVolume);
    }

    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', playNextSong);
    window.addEventListener('resize', resizeCanvas);
}

function setupMobileControls() {
    // Remove default button styles
    [playPauseBtn, prevBtn, nextBtn].forEach(btn => {
        btn.style.webkitTapHighlightColor = 'transparent';
        btn.style.webkitTouchCallout = 'none';
        btn.style.webkitUserSelect = 'none';
        btn.style.userSelect = 'none';
    });

    // Add touch event listeners to prevent button selection
    [playPauseBtn, prevBtn, nextBtn].forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btn.classList.add('active');
        });
        btn.addEventListener('touchend', () => {
            btn.classList.remove('active');
        });
    });

    // Create a custom volume control for mobile
    const volumeControl = document.createElement('div');
    volumeControl.className = 'mobile-volume-control';
    volumeControl.innerHTML = `
        <button id="volumeDownBtn">-</button>
        <span id="volumeDisplay">100%</span>
        <button id="volumeUpBtn">+</button>
    `;
    volumeSlider.parentNode.replaceChild(volumeControl, volumeSlider);

    const volumeDownBtn = document.getElementById('volumeDownBtn');
    const volumeUpBtn = document.getElementById('volumeUpBtn');
    const volumeDisplay = document.getElementById('volumeDisplay');

    volumeDownBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        adjustMobileVolume(-0.1);
    });

    volumeUpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        adjustMobileVolume(0.1);
    });

    function adjustMobileVolume(delta) {
        audioPlayer.volume = Math.max(0, Math.min(1, audioPlayer.volume + delta));
        volumeDisplay.textContent = `${Math.round(audioPlayer.volume * 100)}%`;
    }
}

function populateSongList() {
    songList.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = song.title;
        li.addEventListener('click', () => playSong(index));
        li.addEventListener('touchstart', () => playSong(index));
        songList.appendChild(li);
    });
}

function playSong(index) {
    currentSongIndex = index;
    audioPlayer.src = songs[index].file;
    audioPlayer.play().then(() => {
        playPauseBtn.textContent = '❚❚';
        updateActiveSong();
        if (!audioContext) {
            initAudioContext();
        }
    }).catch(e => console.error('Error playing audio:', e));
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
        audioPlayer.play().then(() => {
            playPauseBtn.textContent = '❚❚';
            if (!audioContext) {
                initAudioContext();
            }
        }).catch(e => console.error('Error resuming playback:', e));
    } else {
        audioPlayer.pause();
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

function seekStart(e) {
    e.preventDefault();
    audioPlayer.pause();
}

function seekMove(e) {
    e.preventDefault();
    const progressWidth = progressContainer.clientWidth;
    const touchX = e.touches[0].clientX - progressContainer.getBoundingClientRect().left;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (touchX / progressWidth) * duration;
    updateProgress();
}

function seekEnd() {
    audioPlayer.play();
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

function initAudioContext() {
    if (!audioContext) {
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
}

function setupVisualizer() {
    const canvas = visualizer;
    const ctx = canvas.getContext('2d');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);

        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / dataArray.length) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            barHeight = dataArray[i] / 2;

            ctx.fillStyle = `hsl(${i * 2}, 100%, 50%)`;
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

            x += barWidth + 1;
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

function createImmersiveBackground() {
    const container = document.getElementById('deep-space-background');
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        container.appendChild(star);
    }
}

// Navbar behavior
let lastScrollTop = 0;
const scrollThreshold = 100;

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > scrollThreshold) {
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

navbar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > scrollThreshold) {
            navbar.classList.add('hidden');
        }
    });
});