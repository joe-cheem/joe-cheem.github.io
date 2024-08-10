const secretText = document.getElementById('secretText');
const MAX_TAPS = 8;
const TAP_TIMEOUT = 500;
const SCROLL_DELAY = 500;

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

    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }

    scrollTimeout = setTimeout(scrollToTop, SCROLL_DELAY);

    if (tapCount === MAX_TAPS) {
        clearTimeout(scrollTimeout);
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
        console.error('$&cr&t t&xt &l&m&nt n#t f#und');
    }
}

document.addEventListener('DOMContentLoaded', initializeSecret);