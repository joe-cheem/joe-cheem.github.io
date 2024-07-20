// Global variables
let audioPlayer, playPauseBtn, prevBtn, nextBtn, progressContainer, progress, timeDisplay, volumeSlider, songList, songTitleElement;
let songs = [];
let currentSongIndex = 0;
let isPlaying = false;
let isSeeking = false;
let currentDisplayText = '';
let isAnimating = false;
let lastPlayState = false;
let animationQueue = [];

// Initialize the player when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    audioPlayer = document.getElementById('audioPlayer');
    playPauseBtn = document.getElementById('playPauseBtn');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    progressContainer = document.getElementById('progressContainer');
    progress = document.getElementById('progress');
    timeDisplay = document.getElementById('timeDisplay');
    volumeSlider = document.getElementById('volumeSlider');
    songList = document.getElementById('songList');
    songTitleElement = document.getElementById('song-title');

    // Initialize the song title display immediately
    songTitleElement.textContent = 'Loading...';

    initializePlayer();
});

// Initialize the player
async function initializePlayer() {
    try {
        const response = await fetch('music.json');
        const data = await response.json();
        songs = data.map(filename => ({
            title: filename.replace('.mp3', ''),
            file: `music/${filename}`
        }));
        
        populateSongList();
        setupEventListeners();
        await loadSong(currentSongIndex);
        
        // Force an update of the progress bar and song title display
        updateProgress();
        updateSongTitleDisplay(true);
        
        console.log('Player initialized');
        console.log('Current song index:', currentSongIndex);
        console.log('Is Playing:', isPlaying);
    } catch (error) {
        console.error('Error initializing player:', error);
        songTitleElement.textContent = 'Error loading songs';
    }
}

// Set up event listeners for player controls
function setupEventListeners() {
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPreviousSong);
    nextBtn.addEventListener('click', playNextSong);
    progressContainer.addEventListener('touchstart', startSeeking);
    progressContainer.addEventListener('touchmove', seek);
    progressContainer.addEventListener('touchend', endSeeking);
    progressContainer.addEventListener('mousedown', startSeeking);
    progressContainer.addEventListener('mousemove', seek);
    progressContainer.addEventListener('mouseup', endSeeking);
    progressContainer.addEventListener('mouseleave', endSeeking);
    volumeSlider.addEventListener('input', adjustVolume);
    audioPlayer.addEventListener('ended', playNextSong);
    audioPlayer.addEventListener('loadedmetadata', () => {
        updateDuration();
        updateProgress();
    });
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        updatePlayPauseButton();
        if (!lastPlayState) updateSongTitleDisplay(true);
        lastPlayState = true;
    });
    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayPauseButton();
        if (lastPlayState) updateSongTitleDisplay(true);
        lastPlayState = false;
    });
}

// Populate the song list
function populateSongList() {
    songList.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = song.title;
        li.addEventListener('click', () => playSong(index));
        songList.appendChild(li);
    });
}

// Load a song
async function loadSong(index) {
    currentSongIndex = index;
    audioPlayer.src = songs[index].file;
    updateActiveSong();
    
    // Ensure metadata is loaded before continuing
    await new Promise(resolve => {
        if (audioPlayer.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            resolve();
        } else {
            audioPlayer.addEventListener('loadedmetadata', resolve, { once: true });
        }
    });
    
    updateDuration();
    updateProgress();
    updateSongTitleDisplay(true);
}

// Play a song
async function playSong(index) {
    await loadSong(index);
    audioPlayer.play().catch(e => console.error('Error playing audio:', e));
}

// Update the active song in the list
function updateActiveSong() {
    songList.querySelectorAll('li').forEach((li, index) => {
        if (index === currentSongIndex) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });
}

// Toggle play/pause
function togglePlayPause() {
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play().catch(e => console.error('Error playing audio:', e));
    }
}

// Update play/pause button appearance
function updatePlayPauseButton() {
    playPauseBtn.textContent = isPlaying ? '❚❚' : '▶';
}

// Play the previous song
function playPreviousSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
}

// Play the next song
function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
}

// Start seeking
function startSeeking(e) {
    isSeeking = true;
    seek(e);
}

// End seeking
function endSeeking() {
    if (isSeeking) {
        isSeeking = false;
        if (isPlaying) {
            audioPlayer.play();
        }
    }
}

// Seek to a specific point in the song
function seek(e) {
    if (!isSeeking && e.type === 'mousemove') return;
    e.preventDefault();
    const progressRect = progressContainer.getBoundingClientRect();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const seekPosition = clientX - progressRect.left;
    const seekPercentage = seekPosition / progressRect.width;
    const seekTime = seekPercentage * audioPlayer.duration;
    
    if (!isNaN(seekTime) && isFinite(seekTime)) {
        audioPlayer.currentTime = seekTime;
        updateProgress();
    }
}

// Update the progress bar and time display
function updateProgress() {
    const duration = audioPlayer.duration;
    const currentTime = audioPlayer.currentTime;
    if (duration > 0 && !isNaN(duration) && isFinite(duration)) {
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    }
}

// Update the duration display when metadata is loaded
function updateDuration() {
    const duration = audioPlayer.duration;
    if (duration > 0 && !isNaN(duration) && isFinite(duration)) {
        timeDisplay.textContent = `0:00 / ${formatTime(duration)}`;
    }
}

// Adjust the volume
function adjustVolume() {
    audioPlayer.volume = volumeSlider.value;
}

// Format time in minutes:seconds
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update the song title display with full random character transition
function updateSongTitleDisplay(forceUpdate = false) {
    const currentSong = songs[currentSongIndex];
    if (currentSong) {
        const status = isPlaying ? 'Playing: ' : 'Paused: ';
        const newDisplayText = status + currentSong.title;
        
        if (newDisplayText !== currentDisplayText || forceUpdate) {
            currentDisplayText = newDisplayText;
            
            // Immediately update the text content
            songTitleElement.textContent = currentDisplayText;
            
            // Queue the animation
            animationQueue.push(newDisplayText);
            if (!isAnimating) {
                animateNextInQueue();
            }
        }
    }
}

// Animate the next text in the queue
function animateNextInQueue() {
    if (animationQueue.length === 0) {
        isAnimating = false;
        return;
    }
    
    isAnimating = true;
    const textToAnimate = animationQueue.shift();
    
    // Clear previous content
    songTitleElement.innerHTML = '';
    
    // Create spans for each character
    const spans = textToAnimate.split('').map(char => {
        const span = document.createElement('span');
        span.textContent = getRandomChar(char);
        span.dataset.char = char;
        songTitleElement.appendChild(span);
        return span;
    });

    // Reveal effect
    revealCharacters(spans);
}

// Get a random character preserving case
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
        return char; // Keep spaces and other characters as is
    }
}

// Reveal characters one by one with smooth transition
function revealCharacters(spans) {
    const revealInterval = 50; // ms between each character reveal
    const cycleInterval = 50; // ms between each random character change
    const cyclesPerChar = 5; // number of random cycles before revealing the actual character

    let completedChars = 0;

    spans.forEach((span, index) => {
        let cyclesLeft = cyclesPerChar + index; // Stagger the start

        const intervalId = setInterval(() => {
            if (cyclesLeft > 0) {
                span.textContent = getRandomChar(span.dataset.char);
                cyclesLeft--;
            } else {
                clearInterval(intervalId);
                span.textContent = span.dataset.char;
                completedChars++;
                if (completedChars === spans.length) {
                    animateNextInQueue();
                }
            }
        }, cycleInterval);
    });
}