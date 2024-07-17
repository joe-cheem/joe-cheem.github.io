const navbar = document.getElementById('navbar');
let lastScrollTop = 0;
const scrollThreshold = 100;

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > scrollThreshold) {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }
    lastScrollTop = scrollTop;
});

// Show navbar on hover or touch
navbar.addEventListener('mouseenter', showNavbar);
navbar.addEventListener('touchstart', showNavbar);

function showNavbar() {
    navbar.classList.remove('hidden');
}

// Hide navbar when clicking a link if below threshold
navbar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > scrollThreshold) {
            navbar.classList.add('hidden');
        }
    });
});

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

document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        scrollToElement(targetId);
    });
});

const gameVideos = document.getElementById('gameVideos');
const games = [
    { title: "Game 1", videoId: "dQw4w9WgXcQ", description: "Description of Game 1" },
    { title: "Game 2", videoId: "dQw4w9WgXcQ", description: "Description of Game 2" }
];

games.forEach(game => {
    const videoContainer = document.createElement('div');
    videoContainer.classList.add('video-container');
    
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${game.videoId}`;
    iframe.allowFullscreen = true;
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');

    const title = document.createElement('h3');
    title.textContent = game.title;

    const description = document.createElement('p');
    description.textContent = game.description;

    videoContainer.appendChild(title);
    videoContainer.appendChild(iframe);
    videoContainer.appendChild(description);
    
    gameVideos.appendChild(videoContainer);
});