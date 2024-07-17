document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.getElementById('navbar');
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    const navbarHeight = navbar.offsetHeight;
    const headerHeight = header.offsetHeight;
    const navbarOriginalTop = navbar.offsetTop;

    function handleScroll() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > navbarOriginalTop) {
            if (!navbar.classList.contains('sticky')) {
                navbar.classList.add('sticky');
                document.body.style.paddingTop = navbarHeight + 'px';
            }
            if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
                navbar.classList.add('partially-hidden');
            } else {
                navbar.classList.remove('partially-hidden');
            }
        } else {
            navbar.classList.remove('sticky');
            document.body.style.paddingTop = '0';
            navbar.classList.remove('partially-hidden');
        }

        lastScrollTop = scrollTop;
    }

    window.addEventListener('scroll', handleScroll);

    navbar.addEventListener('mouseenter', function() {
        if (navbar.classList.contains('sticky')) {
            navbar.classList.remove('partially-hidden');
        }
    });

    navbar.addEventListener('mouseleave', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (navbar.classList.contains('sticky') && scrollTop > headerHeight) {
            navbar.classList.add('partially-hidden');
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Populate game videos
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

    // Initial call to set navbar position
    handleScroll();
});