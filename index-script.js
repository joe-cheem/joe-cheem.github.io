// Function to handle scrolling behavior of the navbar
const navbar = document.getElementById('navbar');
let lastScrollTop = 0;
const scrollThreshold = 300; // Adjust this value to change when the navbar starts hiding

window.addEventListener('scroll', () => {
    let scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    if (scrollTop > scrollThreshold) {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }
    lastScrollTop = scrollTop;
});

// Show navbar on hover
navbar.addEventListener('mouseenter', () => {
    navbar.classList.remove('hidden');
});

// Hide navbar when clicking a link if below threshold
navbar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        let scrollTop = window.scrollY || document.documentElement.scrollTop;
        if (scrollTop > scrollThreshold) {
            navbar.classList.add('hidden');
        }
    });
});

// Function to scroll to a specific element smoothly
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    const navbarHeight = document.getElementById('navbar').offsetHeight;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

    window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
    });
}

// Smooth scrolling for navbar links
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        scrollToElement(targetId);
    });
});

// Populate game videos dynamically
const gameVideos = document.getElementById('gameVideos');
const games = [
    { title: "Game 1", videoId: "dQw4w9WgXcQ", description: "Description of Game 1" },
    { title: "Game 2", videoId: "dQw4w9WgXcQ", description: "Description of Game 2" }
];

games.forEach(game => {
    const videoContainer = document.createElement('div');
    videoContainer.classList.add('video-container');
    videoContainer.innerHTML = `
        <h3>${game.title}</h3>
        <iframe src="https://www.youtube.com/embed/${game.videoId}" 
                title="${game.title}" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
        </iframe>
        <p>${game.description}</p>
    `;
    gameVideos.appendChild(videoContainer);
});

// Intersection observer to trigger fade-in animations
function handleIntersection(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationDelay = '0.2s';
            entry.target.style.animationDuration = '0.8s';
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}

const observer = new IntersectionObserver(handleIntersection, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
});

document.querySelectorAll('.section, .video-container').forEach(el => {
    observer.observe(el);
});
