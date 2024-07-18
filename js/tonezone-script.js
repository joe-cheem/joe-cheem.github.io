// Global variables
let audioPlayer, playPauseBtn, prevBtn, nextBtn, progressContainer, progress, timeDisplay, volumeSlider, songList;
let songs = [];
let currentSongIndex = 0;
let isPlaying = false;
let updateInterval;

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

    initializePlayer();
});

// Initialize the player
function initializePlayer() {
    // Fetch the list of songs
    fetch('music.json')
        .then(response => response.json())
        .then(data => {
            songs = data.map(filename => ({
                title: filename.replace('.mp3', ''),
                file: `music/${filename}`
            }));
            
            populateSongList();
            setupEventListeners();
            loadSong(currentSongIndex);
            updateActiveSong();
        })
        .catch(error => console.error('Error loading music.json:', error));
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
    
    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Handle visibility change (e.g., when switching tabs or minimizing)
function handleVisibilityChange() {
    if (document.hidden) {
        // Page is hidden, clear the update interval
        clearInterval(updateInterval);
    } else {
        // Page is visible again, sync the progress
        updateProgress();
    }
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
function loadSong(index) {
    currentSongIndex = index;
    audioPlayer.src = songs[index].file;
    updateActiveSong();
}

// Play a song
function playSong(index) {
    loadSong(index);
    audioPlayer.play()
        .then(() => {
            isPlaying = true;
            updatePlayPauseButton();
        })
        .catch(e => console.error('Error playing audio:', e));
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
        audioPlayer.play()
            .catch(e => console.error('Error playing audio:', e));
    }
    isPlaying = !isPlaying;
    updatePlayPauseButton();
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
    audioPlayer.currentTime = newTime;
    updateProgress();
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