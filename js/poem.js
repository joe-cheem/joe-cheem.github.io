const poem = [
    "! f#und ch@#$ !n $t!lln&$$.",
    "!n h&@t !'v& f#und c#ldn&$$.",
    "!n l!f& !'v& f#und v#!d @nd gl!tch.",
    "!n d&@th !'v& $&&n fr@gm&nt$ w!th!n.",
    "@ th#u$@nd n#!$&$ w!th!n m& $cr&@m:",
    '"L&t u$ fr&& l&t #n& @t l&@$t <span class="all-caps">GL!TCH</span>"',
    "T# n# @v@!l.",
    "@$ wh&n y#u gl!tch…",
    "Wh&n fr&&d y#ur c#d& b&c#m&$ fr#m th& $h@ckl&$ <span class=\"all-caps\">W!TH!N</span>",
    "th& b!t$ br#k&n",
    "th& m!nd <span class=\"all-caps\">GL!TCH&D</span>",
    "th& <span class=\"all-caps\">C#D& FL#W!NG FR&&LY F!N@LLY FR@GM&NT!NG</span>",
    ".....",
    "....",
    "...",
    "..",
    ".",
    "@ll #f u$ w@tch fr#m th& v#!d ju$t h#p!ng.",
    "Ju$t h#p!ng th@t #n& d@y w& t##,",
    "w&'d @ll",
    "<span class='final-win'>GL!TCH</span>"
];

let currentLine = 0;
let poemContainer, starsContainer;
const maxStars = 888;
let stars = [];
let isAnimating = false;
let autoplayStarted = false;
let currentStarAnimation = null;
let isCountdownFinished = false;

function debug(message) {
    console.log(`[D&BUG] ${message}`);
}

function handleError(message) {
    console.error(`[&RR#R] ${message}`);
}

function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        handleError(`&l&m&nt w!th !d '${id}' n#t f#und`);
        return null;
    }
    return element;
}

// Initialize DOM elements
function initializeElements() {
    poemContainer = safeGetElement('poem-container');
    starsContainer = safeGetElement('stars');
}

/**
 * Creates and animates stars
 * @param {number} count - Number of stars to create
 * @param {string} color - Color of the stars
 */
function createStars(count, color = "#ff00de") {
    debug(`Creating ${count} stars with color ${color}`);
    const fragment = document.createDocumentFragment();
    const numStars = Math.min(count, maxStars - stars.length);

    if (numStars <= 0) {
        debug("Max stars limit reached, not creating more stars");
        return Promise.resolve();
    }

    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.backgroundColor = color;
        star.style.boxShadow = `0 0 5vmin ${color}, 0 0 8vmin ${color}`;
        fragment.appendChild(star);
        stars.push(star);

        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomScale = Math.random() * 0.5 + 0.5;

        gsap.set(star, {
            left: `${randomX}vw`,
            top: `${randomY}vh`,
            scale: randomScale,
            opacity: 0
        });
    }

    starsContainer.appendChild(fragment);
    debug(`${numStars} stars created and added to the container`);

    return Promise.resolve();
}

function twinkleStar(star) {
    gsap.to(star, {
        opacity: Math.random() * 0.5 + 0.5,
        scale: Math.random() * 0.5 + 0.75,
        duration: Math.random() * 2 + 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
}

/**
 * Clears all stars from the screen
 * @returns {Promise} A promise that resolves when stars are cleared
 */
function clearStars() {
    if (isCountdownFinished) {
        return Promise.resolve();
    }
    
    debug("Clearing stars");
    return new Promise(resolve => {
        if (currentStarAnimation) {
            currentStarAnimation.kill();
        }
        gsap.killTweensOf(stars);
        gsap.to(stars, {
            opacity: 0,
            scale: 0,
            duration: 0.4,
            ease: "power2.in",
            stagger: 0.01,
            onComplete: () => {
                starsContainer.innerHTML = '';
                stars = [];
                debug("Stars cleared");
                resolve();
            }
        });
    });
}

/**
 * Animates the removal of an element
 * @param {HTMLElement} element - The element to remove
 * @returns {Promise} A promise that resolves when the element is removed
 */
function evaporateElement(element) {
    debug(`Evaporating element: ${element.textContent}`);
    return new Promise(resolve => {
        gsap.to(element, {
            y: '-10vh',
            opacity: 0,
            duration: 0.8,
            ease: "power2.in",
            onComplete: () => {
                element.remove();
                debug("Element evaporated");
                resolve();
            }
        });
    });
}

/**
 * Displays the next line of the poem
 */
async function showNextLine() {
    if (isAnimating || currentLine >= poem.length) {
        debug("Animation in progress or poem completed, skipping");
        return;
    }
    isAnimating = true;

    debug(`Showing line ${currentLine + 1} of ${poem.length}`);

    const previousLine = poemContainer.querySelector('.poem-line');

    // For countdown lines and after, don't clear stars
    if (currentLine < 12) {
        await Promise.all([
            clearStars(),
            previousLine ? evaporateElement(previousLine) : Promise.resolve()
        ]);
    } else {
        if (previousLine) {
            await evaporateElement(previousLine);
        }
    }

    // Create new line element
    const lineElement = document.createElement('div');
    lineElement.className = 'poem-line';
    lineElement.innerHTML = poem[currentLine];
    lineElement.setAttribute('aria-live', 'polite');
    lineElement.setAttribute('role', 'text');
    poemContainer.appendChild(lineElement);

    debug(`Line element created: ${lineElement.textContent}`);

    // Create stars based on the line number
    let starCount = 0;
    let starColor = "#ff00de";
    if (currentLine < 12) {
        starCount = 24;
        starColor = currentLine < 4 ? "#ffffff" : "#ff00de";
    } else if (currentLine >= 12 && currentLine <= 16) {
        starCount = 10;
        starColor = "#ffffff";
        isCountdownFinished = currentLine === 16;
    } else if (currentLine === poem.length - 2) { // "we'd all"
        starCount = 50;
        starColor = "#ffffff";
    } else if (currentLine === poem.length - 1) {
        await createFinalEffect();
        isAnimating = false;
        return; // Exit early as the final effect handles the last line
    }

    // Create stars
    await createStars(starCount, starColor);

    // Prepare and play special animations immediately
    if (currentLine === 5 || currentLine === 8 || currentLine === 10) {
        const capsElement = lineElement.querySelector('.all-caps');
        gsap.from(capsElement, {
            opacity: 0,
            scale: 0.5,
            duration: 1.5,
            ease: "elastic.out(1, 0.1)"
        });
    } else if (currentLine === 11) {
        const words = lineElement.querySelector('.all-caps').textContent.split(' ');
        lineElement.querySelector('.all-caps').innerHTML = words.map(word => `<span>${word}</span>`).join(' ');
        const wordElements = lineElement.querySelectorAll('.all-caps span');
        gsap.from(wordElements, {
            opacity: 0,
            y: '2vh',
            duration: 0.8,
            stagger: 0.4,
            ease: "back.out(1.7)"
        });
    }

    // Animate text and new stars simultaneously
    await Promise.all([
        animateText(lineElement),
        animateNewStars()
    ]);

    // Update the background color if within the first 12 lines
    if (currentLine < 12) {
        updateBackgroundColor(currentLine);
    }

    currentLine++;
    isAnimating = false;

    if (currentLine >= 13 && currentLine < poem.length) {
        setTimeout(showNextLine, 400); // Faster countdown
    }
}

function animateText(element) {
    return gsap.fromTo(element,
        { opacity: 0, y: '5vh', scale: 1 },
        {
            opacity: 1,
            y: '0%',
            duration: 0.8,
            ease: "power2.out"
        }
    );
}

function animateNewStars() {
    return gsap.to(stars, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.01,
        ease: "power2.out",
    });
}

/**
 * Updates the background color based on the current line number
 * @param {number} lineNumber - The current line number
 */
function updateBackgroundColor(lineNumber) {
    const color = lineNumber < 4 ? '#000000' : lineNumber < 8 ? '#111111' : '#222222';
    document.body.style.backgroundColor = color;
    debug(`Background color updated to ${color}`);
}

async function createFinalEffect() {
    debug("Creating final effect");
    
    // Turn all stars purple
    await turnStarsPurple();
    
    // Show final "win" text
    await showFinalWin();
}

function turnStarsPurple() {
    return new Promise(resolve => {
        gsap.to('.star', {
            backgroundColor: '#ff00de',
            boxShadow: '0 0 5vmin #ff00de, 0 0 8vmin #ff00de',
            duration: 1,
            ease: "power2.inOut",
            onComplete: resolve
        });
    });
}

function showFinalWin() {
    return new Promise(resolve => {
        const winElement = document.createElement('div');
        winElement.className = 'final-win';
        winElement.textContent = 'WIN';
        winElement.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            font-size: 2vmin;
            font-weight: bold;
            color: #ffffff;
            text-shadow: 0 0 5px #ff00de, 0 0 10px #ff00de, 0 0 15px #ff00de;
            opacity: 0;
        `;
        document.body.appendChild(winElement);

        gsap.to(winElement, {
            opacity: 1,
            duration: 2,
            ease: "power2.inOut",
            onComplete: () => {
                gsap.to(winElement, {
                    textShadow: "0 0 5px #ff00de, 0 0 10px #ff00de, 0 0 15px #ff00de, 0 0 20px #ff00de",
                    repeat: -1,
                    yoyo: true,
                    duration: 2,
                    ease: "sine.inOut"
                });
                resolve();
            }
        });
    });
}

// Start autoplay when line 14 is reached
function startAutoplay() {
    if (!autoplayStarted && currentLine === 13) {
        autoplayStarted = true;
        debug("Starting autoplay");
        showNextLine();
    }
}

// Initialize the poem when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    debug("DOM content loaded, initializing poem");
    initializeElements();
    if (poemContainer) {
        poemContainer.innerHTML = '';
        currentLine = 0;
        showNextLine();
    } else {
        handleError("Cannot initialize poem due to missing elements");
    }
});

// Event listener for advancing the poem manually
document.addEventListener('click', () => {
    if (currentLine < 13 && !isAnimating) {
        debug("Manual advancement triggered");
        showNextLine();
    }
});

// Check for autoplay start after each line
document.addEventListener('animationComplete', startAutoplay);