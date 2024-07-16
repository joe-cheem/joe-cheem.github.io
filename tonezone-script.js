let audioPlayer, playPauseBtn, prevBtn, nextBtn, progressContainer, progress, timeDisplay, volumeSlider, songList, visualizer, navbar;
let audioContext, analyser, source, dataArray;
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
    createImmersiveBackground();
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
            initAudioContext();
        })
        .catch(error => console.error('Error loading music.json:', error));
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

function populateSongList() {
    songList.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = song.title;
        li.addEventListener('click', () => playSong(index));
        songList.appendChild(li);
    });
}

function setupEventListeners() {
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPreviousSong);
    nextBtn.addEventListener('click', playNextSong);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    volumeSlider.addEventListener('input', adjustVolume);
    progressContainer.addEventListener('click', seek);
    audioPlayer.addEventListener('ended', playNextSong);
    window.addEventListener('resize', resizeCanvas);
}

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaElementSource(audioPlayer);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
    }
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
                setupVisualizer();
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

function setupVisualizer() {
    const canvas = document.getElementById('cosmic-visualizer');
    const ctx = canvas.getContext('2d');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    function mandelbrot(c) {
        let z = { x: 0, y: 0 }, n = 0, p, d;
        do {
            p = {
                x: Math.pow(z.x, 2) - Math.pow(z.y, 2),
                y: 2 * z.x * z.y
            };
            z = {
                x: p.x + c.x,
                y: p.y + c.y
            };
            d = Math.sqrt(Math.pow(z.x, 2) + Math.pow(z.y, 2));
            n++;
        } while (d <= 2 && n < 100);
        return [n, d <= 2];
    }

    function drawFractal(audioData) {
        ctx.fillStyle = 'rgba(5, 5, 16, 0.1)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        for (let i = 0; i < WIDTH; i++) {
            for (let j = 0; j < HEIGHT; j++) {
                let c = {
                    x: (i - WIDTH / 2) * 4 / WIDTH,
                    y: (j - HEIGHT / 2) * 4 / HEIGHT
                };
                let [m, isMandelbrotSet] = mandelbrot(c);
                if (!isMandelbrotSet) {
                    let hue = ((m * 10) + audioData[i % audioData.length]) % 360;
                    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                    ctx.fillRect(i, j, 1, 1);
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        analyser.getByteFrequencyData(dataArray);
        drawFractal(dataArray);
    }

    animate();
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
    const container = document.getElementById('immersive-background');
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

navbar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > scrollThreshold) {
            navbar.classList.add('hidden');
        }
    });
});