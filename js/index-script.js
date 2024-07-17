// Navbar behavior
const navbar = document.getElementById('navbar');
let lastScrollTop = 0;
const scrollThreshold = 100;
let navbarTimeout;

function hideNavbar() {
    navbar.classList.add('hidden');
}

function showNavbar() {
    navbar.classList.remove('hidden');
}

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
        hideNavbar();
    } else {
        showNavbar();
    }
    lastScrollTop = scrollTop;
});

navbar.addEventListener('mouseenter', () => {
    showNavbar();
    clearTimeout(navbarTimeout);
});

navbar.addEventListener('mouseleave', () => {
    navbarTimeout = setTimeout(hideNavbar, 2000); // Hide after 2 seconds
});

// Show navbar when clicking a link
navbar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        showNavbar();
        navbar.classList.add('active');
        clearTimeout(navbarTimeout);
        navbarTimeout = setTimeout(() => {
            navbar.classList.remove('active');
            hideNavbar();
        }, 2000);
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

// Intersection observer for fade-in animations
const observer = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.1 }
);

document.querySelectorAll('.section, .video-container').forEach(el => {
    observer.observe(el);
});