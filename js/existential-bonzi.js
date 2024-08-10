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

const loadQuotes = async () => {
    try {
        const response = await fetch('bonzi-quotes.json');
        const data = await response.json();
        hoverQuotes = data.hoverQuotes || [];
        clickQuotes = data.clickQuotes || [];
        mobileQuotes = data.mobileQuotes || [];
    } catch (error) {
        console.error('Error loading quotes:', error);
    }
};

const initExistentialBonzi = () => {
    bonziContainer = document.createElement('div');
    bonziContainer.id = 'bonzi-container';
    bonziContainer.style.display = 'none';
    bonziContainer.innerHTML = `
        <img id="bonzi" src="images/Bonzi_Buddy.webp" alt="Bonzi Buddy" tabindex="0">
        <div id="speech-bubble" role="status" aria-live="polite"></div>
    `;
    document.body.appendChild(bonziContainer);

    bonzi = document.getElementById('bonzi');
    speechBubble = document.getElementById('speech-bubble');

    const triggerArea = document.getElementById('bonzi-trigger-area');
    triggerArea.addEventListener('click', handleTriggerAreaTap);

    if ('ontouchstart' in window) {
        // Mobile behavior
        bonzi.addEventListener('touchstart', handleBonziTap);
    } else {
        // Desktop behavior
        bonzi.addEventListener('click', handleBonziTap);
        bonzi.addEventListener('mouseenter', handleBonziHoverStart);
        bonzi.addEventListener('mouseleave', handleBonziHoverEnd);
        bonzi.addEventListener('focus', handleBonziHoverStart);
        bonzi.addEventListener('blur', handleBonziHoverEnd);
    }

    // Add keyboard support
    bonzi.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBonziTap(e);
        }
    });
};

const handleTriggerAreaTap = (e) => {
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
};

const handleBonziTap = (e) => {
    e.preventDefault();
    if (!isInteractionAllowed) return;

    clearTimeout(hoverTimeout);
    bonzi.classList.remove('bounce');

    shakeBonzi();
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
};

const handleBonziHoverStart = () => {
    if (isInteractionAllowed) {
        bonzi.classList.add('bounce');
        hoverTimeout = setTimeout(() => {
            showSpeechBubble(hoverQuotes);
        }, 0);
    }
};

const handleBonziHoverEnd = () => {
    clearTimeout(hoverTimeout);
    bonzi.classList.remove('bounce', 'shake');
};

const revealBonzi = () => {
    bonziContainer.style.display = 'block';
    bonziContainer.style.animation = 'fadeIn 0.5s';
    bonzi.setAttribute('aria-hidden', 'false');
};

const showSecretMessage = () => {
    const secretMessage = "Y#u'v& d!$c#v&r&d th& $&cr&t! B&f#r& ! g#, w@nt t# pl@y @ g@m&?";
    showSpeechBubbleWithOptions(secretMessage, "Y&$", "N#", handleSecretGameInvitationResponse);
};

const handleSecretGameInvitationResponse = (response) => {
    if (response === "Y&$") {
        hideBonzi(() => {
            window.location.href = 'winterbells.html';
        });
    } else {
        hideBonzi();
    }
};

const hideBonzi = (callback) => {
    bonziContainer.style.animation = 'fadeOut 1s';
    setTimeout(() => {
        bonziContainer.style.display = 'none';
        resetBonziState();
        bonzi.setAttribute('aria-hidden', 'true');
        if (callback) callback();
    }, 1000);
};

const resetBonziState = () => {
    tapCount = 0;
    bonziTapCount = 0;
    lastTapTime = 0;
    isInteractionAllowed = true;
    lastQuote = '';
    clearTimeout(bonziClickTimer);
    clearTimeout(messageTimer);
    clearTimeout(hoverTimeout);
    speechBubble.classList.remove('visible', 'fade-in', 'fade-out', 'quick-fade-out');
    speechBubble.innerHTML = '';
};

const showSpeechBubble = (quotes) => {
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
};

const showSpeechBubbleWithOptions = (message, option1, option2, callback) => {
    if (!isInteractionAllowed) return;

    isInteractionAllowed = false;
    
    if (speechBubble.classList.contains('visible')) {
        speechBubble.classList.add('quick-fade-out');
        setTimeout(() => {
            updateSpeechBubbleWithOptions(message, option1, option2, callback);
        }, 150);
    } else {
        updateSpeechBubbleWithOptions(message, option1, option2, callback);
    }
};

const getUniqueQuote = (quotes) => {
    let newQuote;
    do {
        newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    } while (newQuote === lastQuote && quotes.length > 1);
    lastQuote = newQuote;
    return newQuote;
};

const calculateDisplayTime = (text) => {
    const baseTime = 880;
    const timePerChar = 25;
    let totalTime = baseTime + (text.length * timePerChar);
    return Math.max(1500, Math.min(totalTime, 5000));
};

const updateSpeechBubble = (quote) => {
    speechBubble.textContent = quote;
    speechBubble.classList.remove('fade-out', 'quick-fade-out');
    speechBubble.classList.add('visible', 'fade-in');
    
    clearTimeout(messageTimer);
    
    const displayTime = calculateDisplayTime(quote);
    
    messageTimer = setTimeout(() => {
        speechBubble.classList.remove('fade-in');
        speechBubble.classList.add('fade-out');
        setTimeout(() => {
            speechBubble.classList.remove('visible', 'fade-out');
            setTimeout(() => {
                isInteractionAllowed = true;
            }, 50);
        }, 500);
    }, displayTime);
};

const updateSpeechBubbleWithOptions = (message, option1, option2, callback) => {
    speechBubble.innerHTML = `
        <p>${message}</p>
        <div class="speech-bubble-options">
            <button class="speech-bubble-option" data-option="${option1}">${option1}</button>
            <button class="speech-bubble-option" data-option="${option2}">${option2}</button>
        </div>
    `;
    speechBubble.classList.remove('fade-out', 'quick-fade-out');
    speechBubble.classList.add('visible', 'fade-in');
    
    const options = speechBubble.querySelectorAll('.speech-bubble-option');
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            callback(e.target.dataset.option);
        });
    });

    // Remove automatic focus on the first button
    // options[0].focus();

    speechBubble.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const currentIndex = Array.from(options).indexOf(document.activeElement);
            const nextIndex = e.key === 'ArrowRight' ? (currentIndex + 1) % 2 : (currentIndex - 1 + 2) % 2;
            options[nextIndex].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.activeElement.click();
        }
    });
};

const hideSpeechBubble = () => {
    speechBubble.classList.remove('fade-in');
    speechBubble.classList.add('fade-out');
    setTimeout(() => {
        speechBubble.classList.remove('visible', 'fade-out');
        isInteractionAllowed = true;
    }, 500);
};

const shakeBonzi = () => {
    bonzi.classList.remove('shake');
    void bonzi.offsetWidth; // Trigger reflow
    bonzi.classList.add('shake');
    setTimeout(() => bonzi.classList.remove('shake'), 500);
};

const isMobile = () => 'ontouchstart' in window;

// Debounce function to limit the rate of function calls
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function to limit the rate of function calls
const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Use IntersectionObserver for lazy loading Bonzi
const lazyLoadBonzi = () => {
    const bonziImg = document.querySelector('#bonzi');
    if (!bonziImg) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                bonziImg.src = bonziImg.dataset.src || bonziImg.src;
                bonziImg.removeAttribute('data-src');
                observer.unobserve(bonziImg);
            }
        });
    }, { rootMargin: '100px' });

    observer.observe(bonziImg);
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadQuotes();
    initExistentialBonzi();
    lazyLoadBonzi();

    // Add resize listener with throttle
    window.addEventListener('resize', throttle(() => {
        // Adjust Bonzi position or size based on window size
        const bonziContainer = document.getElementById('bonzi-container');
        if (window.innerWidth < 768) {
            bonziContainer.style.right = '10px';
            bonziContainer.style.bottom = '10px';
        } else {
            bonziContainer.style.right = '20px';
            bonziContainer.style.bottom = '20px';
        }
    }, 250));

    // Add scroll listener with throttle
    window.addEventListener('scroll', throttle(() => {
        // Hide Bonzi when scrolling down, show when scrolling up
        const currentScrollPos = window.pageYOffset;
        if (currentScrollPos > lastScrollPos) {
            bonziContainer.classList.add('hide-bonzi');
        } else {
            bonziContainer.classList.remove('hide-bonzi');
        }
        lastScrollPos = currentScrollPos;
    }, 250));
});

// Accessibility improvements
const improveAccessibility = () => {
    const bonzi = document.getElementById('bonzi');
    bonzi.setAttribute('role', 'button');
    bonzi.setAttribute('aria-label', 'Interact with Bonzi Buddy');
    bonzi.setAttribute('tabindex', '0');

    const speechBubble = document.getElementById('speech-bubble');
    speechBubble.setAttribute('aria-live', 'polite');
    speechBubble.setAttribute('role', 'status');
};

// Call improveAccessibility after Bonzi is initialized
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(improveAccessibility, 1000);
});