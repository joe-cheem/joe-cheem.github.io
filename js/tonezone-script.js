let audioPlayer, playPauseBtn, prevBtn, nextBtn, skipBackwardBtn, skipForwardBtn, progressContainer, progress, timeDisplay, volumeSlider, songList, songTitleElement;
let songs = [];
let currentSongIndex = 0;
let isPlaying = false;
let isAudioInitialized = false;
let isInitializing = false;
let hasUserInteracted = false;
let currentDisplayText = '';

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

    songTitleElement.textContent = 'L#@d!ng...';

    try {
        await loadSongs();
        createSongList();
        setupEventListeners();
        await loadSong(currentSongIndex);
        updateActiveSong();
        
        audioPlayer.pause();
        isPlaying = false;
        updatePlayPauseButton();
        updateSongTitleDisplay();
        
        playPauseBtn.addEventListener('click', handlePlayPauseClick);
        skipBackwardBtn.addEventListener('click', initializeAudioOnFirstInteraction);
        skipForwardBtn.addEventListener('click', initializeAudioOnFirstInteraction);
        progressContainer.addEventListener('click', initializeAudioOnFirstInteraction);
        
    } catch (error) {
        console.error('&rr#r !n!t!@l!z!ng pl@y&r:', error);
        songTitleElement.textContent = '&rr#r l#@d!ng $#ng$';
        updateLiveRegion('&rr#r l#@d!ng th& $#ng l!$t. Pl&@$& r&fr&$h th& p@g& #r try @g@!n l@t&r.');
    }
}

async function loadSongs() {
    const musicJsonUrl = new URL('music.json', window.location.href).href;
    const response = await fetch(musicJsonUrl);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    songs = data.map(filename => ({
        title: filename.replace('.mp3', ''),
        file: new URL(`music/${filename}`, window.location.href).href
    }));
    console.log('Songs loaded:', songs);
}

async function initializeAudioOnFirstInteraction(event) {
    if (!isAudioInitialized && !isInitializing) {
        isInitializing = true;
        try {
            await audioPlayer.play();
            audioPlayer.pause();
            isAudioInitialized = true;
            console.log('Audio initialized on first interaction');
            
            skipBackwardBtn.removeEventListener('click', initializeAudioOnFirstInteraction);
            skipForwardBtn.removeEventListener('click', initializeAudioOnFirstInteraction);
            progressContainer.removeEventListener('click', initializeAudioOnFirstInteraction);
            
            if (event.currentTarget === skipBackwardBtn) {
                skipBackward();
            } else if (event.currentTarget === skipForwardBtn) {
                skipForward();
            } else if (event.currentTarget === progressContainer) {
                handleSeek(event);
            }
        } catch (error) {
            console.error('Error initializing audio:', error);
        } finally {
            isInitializing = false;
        }
    }
}

function handlePlayPauseClick() {
    if (!isAudioInitialized) {
        isAudioInitialized = true;
    }
    togglePlayPause();
    updateSongTitleDisplay(); // Update display when play/pause is clicked
}

async function togglePlayPause() {
    if (isInitializing) return;

    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play().catch(e => console.error('Error playing audio:', e));
    }
    isPlaying = !isPlaying;
    updatePlayPauseButton();
}

async function playSong(index) {
    await loadSong(index);
    await ensureAudioInitialized();
    audioPlayer.play().catch(e => console.error('Error playing audio:', e));
    isPlaying = true;
    updatePlayPauseButton();
    updateSongTitleDisplay(); // Update display when switching songs
    updateLiveRegion(`Now playing: ${songs[index].title}`);
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
    playPauseBtn.addEventListener('click', handlePlayPauseClick);
    prevBtn.addEventListener('click', playPreviousSong);
    nextBtn.addEventListener('click', playNextSong);
    skipBackwardBtn.addEventListener('click', skipBackward);
    skipForwardBtn.addEventListener('click', skipForward);
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
            handlePlayPauseClick();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            skipBackward();
            break;
        case 'ArrowRight':
            e.preventDefault();
            skipForward();
            break;
        case 'ArrowUp':
            e.preventDefault();
            increaseVolume();
            break;
        case 'ArrowDown':
            e.preventDefault();
            decreaseVolume();
            break;
    }
}

function increaseVolume() {
    audioPlayer.volume = Math.min(audioPlayer.volume + 0.1, 1);
    volumeSlider.value = audioPlayer.volume;
}

function decreaseVolume() {
    audioPlayer.volume = Math.max(audioPlayer.volume - 0.1, 0);
    volumeSlider.value = audioPlayer.volume;
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
    updateSongTitleDisplay(); // Update display when loading a new song
    scrollToCurrentSong();
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

function updatePlayPauseButton() {
    if (isInitializing) return;

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

async function skipBackward() {
    await ensureAudioInitialized();
    audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 10, 0);
    updateProgress();
}

async function skipForward() {
    await ensureAudioInitialized();
    audioPlayer.currentTime = Math.min(audioPlayer.currentTime + 10, audioPlayer.duration || 0);
    updateProgress();
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
    await ensureAudioInitialized();
    const progressRect = progressContainer.getBoundingClientRect();
    const seekPercentage = (e.clientX - progressRect.left) / progressRect.width;
    const seekTime = seekPercentage * audioPlayer.duration;
    
    if (!isNaN(seekTime)) {
        audioPlayer.currentTime = seekTime;
        updateProgress();
    }
}

function adjustVolume() {
    audioPlayer.volume = volumeSlider.value;
    volumeSlider.setAttribute('aria-valuenow', audioPlayer.volume * 100);
    volumeSlider.setAttribute('aria-valuetext', `Volume ${Math.round(audioPlayer.volume * 100)}%`);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function ensureAudioInitialized() {
    if (!isAudioInitialized) {
        await initializeAudioOnFirstInteraction({ currentTarget: playPauseBtn });
    }
    if (!hasUserInteracted) {
        hasUserInteracted = true;
    }
}

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
    animationTimeouts.forEach(clearInterval);
    animationTimeouts = [];
    isAnimating = false;
}

function updateLiveRegion(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
    }
}