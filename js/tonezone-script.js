let audioPlayer, playPauseBtn, prevBtn, nextBtn, skipBackwardBtn, skipForwardBtn, progressContainer, progress, timeDisplay, volumeSlider, songList, songTitleElement;
let songs = [];
let currentSongIndex = 0;
let isPlaying = false;
let isAudioInitialized = false;

document.addEventListener('DOMContentLoaded', initializePlayer);

async function initializePlayer() {
    audioPlayer = document.getElementById('audioPlayer');
    playPauseBtn = document.getElementById('playPauseBtn');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    skipBackwardBtn = document.getElementById('skipBackwardBtn');
    skipForwardBtn = document.getElementById('skipForwardBtn');
    progressContainer = document.getElementById('progressContainer');
    progress = document.getElementById('progress');
    timeDisplay = document.getElementById('timeDisplay');
    volumeSlider = document.getElementById('volumeSlider');
    songList = document.getElementById('songList');
    songTitleElement = document.getElementById('song-title');

    songTitleElement.textContent = 'Loading...';

    try {
        const response = await fetch('music.json');
        const data = await response.json();
        songs = data.map(filename => ({
            title: filename.replace('.mp3', ''),
            file: `music/${filename}`
        }));
        
        createSongList();
        setupEventListeners();
        await loadSong(currentSongIndex);
        updateActiveSong();
        
        audioPlayer.pause();
        isPlaying = false;
        updatePlayPauseButton();
        updateSongTitleDisplay();
    } catch (error) {
        console.error('Error initializing player:', error);
        songTitleElement.textContent = 'Error loading songs';
        updateLiveRegion('Error loading the song list. Please refresh the page or try again later.');
    }
}

function createSongList() {
    songList.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = song.title;
        li.setAttribute('tabindex', '0');
        li.setAttribute('role', 'button');
        li.setAttribute('aria-label', `Play ${song.title}`);
        li.addEventListener('click', () => playSong(index));
        li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playSong(index);
            }
        });
        songList.appendChild(li);
    });
}

function setupEventListeners() {
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPreviousSong);
    nextBtn.addEventListener('click', playNextSong);
    skipBackwardBtn.addEventListener('click', () => seekRelative(-10));
    skipForwardBtn.addEventListener('click', () => seekRelative(10));
    progressContainer.addEventListener('click', handleSeek);
    volumeSlider.addEventListener('input', adjustVolume);
    audioPlayer.addEventListener('ended', playNextSong);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        updatePlayPauseButton();
    });
    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayPauseButton();
    });

    document.addEventListener('keydown', handleKeyboardControls);
}

function handleKeyboardControls(e) {
    if (e.target.tagName === 'INPUT') return;

    switch (e.key) {
        case ' ':
            e.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            seekRelative(-10);
            break;
        case 'ArrowRight':
            e.preventDefault();
            seekRelative(10);
            break;
        case 'ArrowUp':
            e.preventDefault();
            adjustVolume(0.1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            adjustVolume(-0.1);
            break;
    }
}

async function loadSong(index) {
    currentSongIndex = index;
    audioPlayer.src = songs[index].file;
    updateActiveSong();
    
    await new Promise(resolve => {
        audioPlayer.addEventListener('loadedmetadata', resolve, { once: true });
    });
    
    updateDuration();
    updateProgress();
    updateSongTitleDisplay();
    scrollToCurrentSong();
}

async function playSong(index) {
    await loadSong(index);
    await playAudio();
    updateLiveRegion(`Now playing: ${songs[index].title}`);
}

function updateActiveSong() {
    songList.querySelectorAll('li').forEach((li, index) => {
        const isActive = index === currentSongIndex;
        li.classList.toggle('active', isActive);
        li.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
    scrollToCurrentSong();
}

function scrollToCurrentSong() {
    const activeItem = songList.querySelector('li.active');
    if (activeItem) {
        const listRect = songList.getBoundingClientRect();
        const activeRect = activeItem.getBoundingClientRect();

        if (activeRect.top < listRect.top) {
            songList.scrollTo({
                top: songList.scrollTop + (activeRect.top - listRect.top),
                behavior: 'smooth'
            });
        } else if (activeRect.bottom > listRect.bottom) {
            songList.scrollTo({
                top: songList.scrollTop + (activeRect.bottom - listRect.bottom),
                behavior: 'smooth'
            });
        }
    }
}

async function togglePlayPause() {
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        await playAudio();
    }
}

async function playAudio() {
    try {
        if (!isAudioInitialized) {
            await initializeAudio();
        }
        await audioPlayer.play();
        isPlaying = true;
        updatePlayPauseButton();
        updateSongTitleDisplay();
    } catch (e) {
        console.error('Error playing audio:', e);
    }
}

function updatePlayPauseButton() {
    playPauseBtn.textContent = isPlaying ? '❚❚' : '▶';
    playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
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
    if (duration > 0 && !isNaN(duration)) {
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        progress.setAttribute('aria-valuenow', progressPercent);
        progress.setAttribute('aria-valuetext', `${Math.round(progressPercent)}% complete`);
    }
}

function updateDuration() {
    const duration = audioPlayer.duration;
    if (duration > 0 && !isNaN(duration)) {
        timeDisplay.textContent = `0:00 / ${formatTime(duration)}`;
        progressContainer.setAttribute('aria-label', `Song progress. Total duration: ${formatTime(duration)}`);
    }
}

async function handleSeek(e) {
    if (!isAudioInitialized) {
        await initializeAudio();
    }
    const progressRect = progressContainer.getBoundingClientRect();
    const seekPercentage = (e.clientX - progressRect.left) / progressRect.width;
    const seekTime = seekPercentage * audioPlayer.duration;
    
    if (!isNaN(seekTime)) {
        audioPlayer.currentTime = seekTime;
        updateProgress();
    }
}

async function seekRelative(seconds) {
    if (!isAudioInitialized) {
        await initializeAudio();
    }
    const newTime = Math.max(0, Math.min(audioPlayer.currentTime + seconds, audioPlayer.duration));
    audioPlayer.currentTime = newTime;
    updateProgress();
}

function adjustVolume(delta = 0) {
    const newVolume = Math.max(0, Math.min(audioPlayer.volume + delta, 1));
    audioPlayer.volume = newVolume;
    volumeSlider.value = newVolume;
    volumeSlider.setAttribute('aria-valuenow', newVolume * 100);
    volumeSlider.setAttribute('aria-valuetext', `Volume ${Math.round(newVolume * 100)}%`);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

let currentDisplayText = '';
let isAnimating = false;
let animationTimeouts = [];

function updateSongTitleDisplay() {
    const currentSong = songs[currentSongIndex];
    if (currentSong) {
        const status = isPlaying ? 'Playing: ' : 'Paused: ';
        const newDisplayText = status + currentSong.title;
        
        if (newDisplayText !== currentDisplayText) {
            clearAnimations();
            
            currentDisplayText = newDisplayText;
            isAnimating = true;
            
            songTitleElement.innerHTML = '';
            
            const spans = currentDisplayText.split('').map(char => {
                const span = document.createElement('span');
                span.textContent = getRandomChar(char);
                span.dataset.char = char;
                songTitleElement.appendChild(span);
                return span;
            });

            revealCharacters(spans);
        }
    }
}

function getRandomChar(char) {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()';
    
    if (uppercaseChars.includes(char)) {
        return uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    } else if (lowercaseChars.includes(char)) {
        return lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    } else if (numbers.includes(char)) {
        return numbers[Math.floor(Math.random() * numbers.length)];
    } else if (symbols.includes(char)) {
        return symbols[Math.floor(Math.random() * symbols.length)];
    } else {
        return char;
    }
}

function revealCharacters(spans) {
    const cycleInterval = 50;
    const cyclesPerChar = 5;

    let completedChars = 0;

    spans.forEach((span, index) => {
        let cyclesLeft = cyclesPerChar + index;

        const intervalId = setInterval(() => {
            if (cyclesLeft > 0) {
                span.textContent = getRandomChar(span.dataset.char);
                cyclesLeft--;
            } else {
                clearInterval(intervalId);
                span.textContent = span.dataset.char;
                completedChars++;
                if (completedChars === spans.length) {
                    isAnimating = false;
                }
            }
        }, cycleInterval);
        animationTimeouts.push(intervalId);
    });
}

function clearAnimations() {
    animationTimeouts.forEach(clearTimeout);
    animationTimeouts = [];
    isAnimating = false;
}

function updateLiveRegion(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
    }
}

async function initializeAudio() {
    if (!isAudioInitialized) {
        try {
            await audioPlayer.play();
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            isAudioInitialized = true;
            console.log('Audio initialized');
        } catch (error) {
            console.error('Error initializing audio:', error);
        }
    }
}