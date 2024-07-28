const secretText = document.getElementById('secretText');
const MAX_TAPS = 8;
const TAP_TIMEOUT = 500; // milliseconds
const SCROLL_DELAY = 500; // milliseconds

let tapCount = 0;
let lastTapTime = 0;
let scrollTimeout = null;

function handleTap(event) {
    event.preventDefault();
    
    const currentTime = Date.now();
    
    if (currentTime - lastTapTime > TAP_TIMEOUT) {
        tapCount = 1;
    } else {
        tapCount++;
    }

    lastTapTime = currentTime;

    // Cancel any pending scroll
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }

    // Set a new scroll timeout
    scrollTimeout = setTimeout(scrollToTop, SCROLL_DELAY);

    if (tapCount === MAX_TAPS) {
        clearTimeout(scrollTimeout); // Cancel scroll if secret is triggered
        window.location.href = 'everything.html';
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    scrollTimeout = null;
}

function initializeSecret() {
    if (secretText) {
        secretText.addEventListener('click', handleTap);
        secretText.addEventListener('touchstart', handleTap, { passive: false });
    } else {
        console.error('Secret text element not found');
    }
}

document.addEventListener('DOMContentLoaded', initializeSecret);