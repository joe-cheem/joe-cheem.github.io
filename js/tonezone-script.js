document.addEventListener('DOMContentLoaded', function() {
    let audioPlayer, playPauseBtn, prevBtn, nextBtn, progressContainer, progress, timeDisplay, volumeSlider, songList, visualizer;
    let audioContext, analyser, source, dataArray;
    let songs = [];
    let currentSongIndex = 0;
    let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    function initializePlayer() {
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
        volumeSlider.addEventListener('change', adjustVolume);
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('ended', playNextSong);
        window.addEventListener('resize', resizeCanvas);

        if (isMobile) {
            setupMobileTouchEvents();
        }
    }

    function setupMobileTouchEvents() {
        progressContainer.addEventListener('touchstart', seekStart);
        progressContainer.addEventListener('touchmove', seekMove);
        progressContainer.addEventListener('touchend', seekEnd);
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
        document.getElementById('current-song').textContent = songs[currentSongIndex].title.toLowerCase().replace(/ /g, '-');
    }

    function togglePlayPause() {
        if (audioPlayer.paused) {
            audioPlayer.play()
                .then(() => {
                    playPauseBtn.textContent = '❚❚';
                    if (!audioContext) {
                        initAudioContext();
                    }
                })
                .catch(e => console.error('Error resuming playback:', e));
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

    function seekStart(e) {
        audioPlayer.pause();
    }

    function seekMove(e) {
        const progressWidth = progressContainer.clientWidth;
        const touchX = e.touches[0].clientX - progressContainer.getBoundingClientRect().left;
        const duration = audioPlayer.duration;
        audioPlayer.currentTime = (touchX / progressWidth) * duration;
        updateProgress();
    }

    function seekEnd() {
        audioPlayer.play();
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
        let visualizerWidth, visualizerHeight;

        function resizeCanvas() {
            visualizerWidth = canvas.clientWidth;
            visualizerHeight = canvas.clientHeight;
            canvas.width = visualizerWidth * window.devicePixelRatio;
            canvas.height = visualizerHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }

        resizeCanvas();

        function drawVisualizer() {
            requestAnimationFrame(drawVisualizer);

            analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, visualizerWidth, visualizerHeight);

            const barWidth = (visualizerWidth / dataArray.length) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < dataArray.length; i++) {
                barHeight = dataArray[i] / 2;

                ctx.fillStyle = `hsl(${i * 2}, 100%, 50%)`;
                ctx.fillRect(x, visualizerHeight - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        }

        drawVisualizer();
    }

    window.addEventListener('resize', resizeCanvas);

    initializePlayer();
});