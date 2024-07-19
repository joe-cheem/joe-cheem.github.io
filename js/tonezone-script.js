// Global variables
let audioPlayer, playPauseBtn, prevBtn, nextBtn, progressContainer, progress, timeDisplay, volumeSlider, songList, songTitleElement;
let songs = [];
let currentSongIndex = 0;
let isPlaying = false;

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
        updateActiveSong();
        
        // Pause the audio immediately after loading
        audioPlayer.pause();
        isPlaying = false;
        updatePlayPauseButton();
        updateSongTitleDisplay();
        
        console.log('Player initialized');
        console.log('Current song index:', currentSongIndex);
        console.log('Is Playing:', isPlaying);
    } catch (error) {
        console.error('Error initializing player:', error);
    }
}

// Set up event listeners for player controls
function setupEventListeners() {
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPreviousSong);
    nextBtn.addEventListener('click', playNextSong);
    progressContainer.addEventListener('click', seek);
    volumeSlider.addEventListener('input', adjustVolume);
    audioPlayer.addEventListener('ended', playNextSong);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        updatePlayPauseButton();
        updateSongTitleDisplay();
    });
    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayPauseButton();
        updateSongTitleDisplay();
    });

    // Add visibility change event listener for hard refresh
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Handle visibility change (for hard refresh)
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        hardRefresh();
    }
}

// Perform a hard refresh of the player
async function hardRefresh() {
    const currentTime = audioPlayer.currentTime;
    const wasPlaying = !audioPlayer.paused;

    await loadSong(currentSongIndex);
    
    audioPlayer.currentTime = currentTime;
    
    if (wasPlaying) {
        audioPlayer.play();
    }

    updateProgress();
    updateSongTitleDisplay();
    console.log('Hard refresh performed');
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
    if (audioPlayer.readyState === 0) {
        await new Promise(resolve => {
            audioPlayer.addEventListener('loadedmetadata', resolve, { once: true });
        });
    }
    
    updateDuration();
    updateProgress();
    updateSongTitleDisplay();
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

// Update the progress bar and time display
function updateProgress() {
    const duration = audioPlayer.duration;
    const currentTime = audioPlayer.currentTime;
    if (duration > 0 && !isNaN(duration)) {
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    }
}

// Update the duration display when metadata is loaded
function updateDuration() {
    const duration = audioPlayer.duration;
    if (duration > 0 && !isNaN(duration)) {
        timeDisplay.textContent = `0:00 / ${formatTime(duration)}`;
    }
}

// Seek to a specific point in the song
function seek(e) {
    const progressRect = progressContainer.getBoundingClientRect();
    const seekPercentage = (e.clientX - progressRect.left) / progressRect.width;
    const newTime = seekPercentage * audioPlayer.duration;
    if (!isNaN(newTime)) {
        audioPlayer.currentTime = newTime;
        updateProgress();
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


let currentDisplayText = '';
let isAnimating = false;

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
        updateActiveSong();
        
        // Pause the audio immediately after loading
        audioPlayer.pause();
        isPlaying = false;
        updatePlayPauseButton();
        updateSongTitleDisplay();
        
        console.log('Player initialized');
        console.log('Current song index:', currentSongIndex);
        console.log('Is Playing:', isPlaying);
    } catch (error) {
        console.error('Error initializing player:', error);
        songTitleElement.textContent = 'Error loading songs';
    }
}

// Update the song title display with full random character transition
function updateSongTitleDisplay() {
    const currentSong = songs[currentSongIndex];
    if (currentSong) {
        const status = isPlaying ? 'Playing: ' : 'Paused: ';
        const newDisplayText = status + currentSong.title;
        
        if (newDisplayText !== currentDisplayText && !isAnimating) {
            isAnimating = true;
            currentDisplayText = newDisplayText;
            
            // Clear previous content
            songTitleElement.innerHTML = '';
            
            // Create spans for each character
            const spans = currentDisplayText.split('').map(char => {
                const span = document.createElement('span');
                span.textContent = getRandomChar(char);
                span.dataset.char = char;
                songTitleElement.appendChild(span);
                return span;
            });

            // Reveal effect
            revealCharacters(spans);
        }
    }
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
                    isAnimating = false;
                }
            }
        }, cycleInterval);
    });
}