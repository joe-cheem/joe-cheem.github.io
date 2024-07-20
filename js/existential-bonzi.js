let hoverQuotes = [];
let clickQuotes = [];
let mobileQuotes = [];
let bonziContainer;
let bonzi;
let speechBubble;
let tapCount = 0;
let bonziTapCount = 0;
let lastTapTime = 0;
let bonziClickTimer = null;
let messageTimer = null;
let isInteractionAllowed = true;
let lastQuote = '';
let hoverTimeout = null;

async function loadQuotes() {
    try {
        const response = await fetch('bonzi-quotes.json');
        const data = await response.json();
        hoverQuotes = data.hoverQuotes || [];
        clickQuotes = data.clickQuotes || [];
        mobileQuotes = data.mobileQuotes || [];
    } catch (error) {
        console.error('Error loading quotes:', error);
    }
}

function initExistentialBonzi() {
    bonziContainer = document.createElement('div');
    bonziContainer.id = 'bonzi-container';
    bonziContainer.style.display = 'none';
    bonziContainer.innerHTML = `
        <img id="bonzi" src="images/Bonzi_Buddy.webp" alt="Bonzi Buddy">
        <div id="speech-bubble"></div>
    `;
    document.body.appendChild(bonziContainer);

    bonzi = document.getElementById('bonzi');
    speechBubble = document.getElementById('speech-bubble');

    const triggerArea = document.getElementById('bonzi-trigger-area');
    triggerArea.addEventListener('click', handleTriggerAreaTap);

    bonzi.addEventListener('click', handleBonziTap);

    if ('ontouchstart' in window) {
        // Mobile behavior
        bonzi.addEventListener('touchstart', handleBonziTap);
    } else {
        // Desktop behavior
        bonzi.addEventListener('mouseenter', handleBonziHoverStart);
        bonzi.addEventListener('mouseleave', handleBonziHoverEnd);
    }
}

function handleTriggerAreaTap(e) {
    const currentTime = new Date().getTime();
    if (currentTime - lastTapTime < 500) {
        tapCount++;
        if (tapCount === 5) {
            revealBonzi();
            tapCount = 0;
        }
    } else {
        tapCount = 1;
    }
    lastTapTime = currentTime;
}

function handleBonziTap(e) {
    e.preventDefault();
    if (!isInteractionAllowed) return;

    // Cancel any ongoing hover events
    clearTimeout(hoverTimeout);
    bonzi.classList.remove('bounce');

    shakeBonzi(); // Call the shake function on tap
    const currentTime = new Date().getTime();

    if (bonziClickTimer) {
        clearTimeout(bonziClickTimer);
        bonziTapCount++;

        if (bonziTapCount === 5) {
            showSecretMessage();
            bonziTapCount = 0;
            bonziClickTimer = null;
        } else {
            bonziClickTimer = setTimeout(() => {
                showSpeechBubble(isMobile() ? mobileQuotes : clickQuotes);
                bonziTapCount = 0;
                bonziClickTimer = null;
            }, 500);
        }
    } else {
        bonziTapCount = 1;
        bonziClickTimer = setTimeout(() => {
            showSpeechBubble(isMobile() ? mobileQuotes : clickQuotes);
            bonziTapCount = 0;
            bonziClickTimer = null;
        }, 500);
    }

    lastTapTime = currentTime;
}

function handleBonziHoverStart() {
    if (isInteractionAllowed) {
        bonzi.classList.add('bounce'); // Apply bouncing animation class
        hoverTimeout = setTimeout(() => {
            showSpeechBubble(hoverQuotes);
        }, 0); // Show instantly
    }
}

function handleBonziHoverEnd() {
    clearTimeout(hoverTimeout); // Clear the hover timeout
    bonzi.classList.remove('bounce'); // Ensure the animation class is removed
    // Ensure the shake animation is not applied
    bonzi.classList.remove('shake');
}

function revealBonzi() {
    bonziContainer.style.display = 'block';
    bonziContainer.style.animation = 'fadeIn 0.5s';
}

function showSecretMessage() {
    const secretMessage = "You've discovered the secret! I'm fading away now...";
    showSpeechBubble([secretMessage]);
    setTimeout(() => {
        bonziContainer.style.animation = 'fadeOut 1s';
        setTimeout(() => {
            bonziContainer.style.display = 'none';
        }, 1000);
    }, 2000);
}

function showSpeechBubble(quotes) {
    if (!isInteractionAllowed) return;

    isInteractionAllowed = false;
    const newQuote = getUniqueQuote(quotes);
    
    if (speechBubble.classList.contains('visible')) {
        speechBubble.classList.add('quick-fade-out');
        setTimeout(() => {
            updateSpeechBubble(newQuote);
        }, 150);
    } else {
        updateSpeechBubble(newQuote);
    }
}

function getUniqueQuote(quotes) {
    let newQuote;
    do {
        newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    } while (newQuote === lastQuote && quotes.length > 1);
    lastQuote = newQuote;
    return newQuote;
}

function calculateDisplayTime(text) {
    // Base time: 0.88 seconds
    const baseTime = 880;
    // Additional time per character
    const timePerChar = 25; // milliseconds
    // Calculate total time
    let totalTime = baseTime + (text.length * timePerChar);
    // Set minimum and maximum times
    totalTime = Math.max(1500, Math.min(totalTime, 5000));
    return totalTime;
}

function updateSpeechBubble(quote) {
    speechBubble.textContent = quote;
    speechBubble.classList.remove('fade-out', 'quick-fade-out');
    speechBubble.classList.add('visible', 'fade-in');
    
    if (messageTimer) {
        clearTimeout(messageTimer);
    }
    
    const displayTime = calculateDisplayTime(quote);
    
    messageTimer = setTimeout(() => {
        speechBubble.classList.remove('fade-in');
        speechBubble.classList.add('fade-out');
        setTimeout(() => {
            speechBubble.classList.remove('visible', 'fade-out');
            setTimeout(() => {
                isInteractionAllowed = true;
            }, 50); // Small delay to ensure full disappearance
        }, 500); // Matches the CSS transition time
    }, displayTime);
}

function shakeBonzi() {
    bonzi.classList.remove('shake');
    // Trigger a reflow to ensure the removal takes effect immediately
    void bonzi.offsetWidth;
    bonzi.classList.add('shake');
    // Remove the shake class after the animation completes
    setTimeout(() => bonzi.classList.remove('shake'), 500); // 500ms matches the animation duration
}

function isMobile() {
    return 'ontouchstart' in window;
}

// Initialize the widget when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadQuotes();
    initExistentialBonzi();
});
