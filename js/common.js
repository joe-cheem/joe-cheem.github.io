document.addEventListener('DOMContentLoaded', () => {
    setupNavbarBehavior();
});

const setupNavbarBehavior = () => {
    const navbar = document.getElementById('navbar');
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    const navbarHeight = navbar.offsetHeight;
    const headerHeight = header ? header.offsetHeight : 0;
    const navbarOriginalTop = headerHeight;

    const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > navbarOriginalTop) {
            if (!navbar.classList.contains('sticky')) {
                navbar.classList.add('sticky');
                document.body.style.paddingTop = `${navbarHeight}px`;
            }
            if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
        } else {
            navbar.classList.remove('sticky');
            document.body.style.paddingTop = '0';
            navbar.classList.remove('hidden');
        }

        lastScrollTop = scrollTop;
    };

    const handleNavbarHover = (event) => {
        if (navbar.classList.contains('sticky')) {
            navbar.classList.toggle('hidden', event.type === 'mouseleave' && window.pageYOffset > headerHeight);
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    navbar.addEventListener('mouseenter', handleNavbarHover, { passive: true });
    navbar.addEventListener('mouseleave', handleNavbarHover, { passive: true });
};

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});