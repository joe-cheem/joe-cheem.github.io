document.addEventListener('DOMContentLoaded', () => {
    setupNavbarBehavior();
});

function setupNavbarBehavior() {
    const navbar = document.getElementById('navbar');
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    const navbarHeight = navbar.offsetHeight;
    const headerHeight = header ? header.offsetHeight : 0;
    const navbarOriginalTop = headerHeight;

    function handleScroll() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > navbarOriginalTop) {
            if (!navbar.classList.contains('sticky')) {
                navbar.classList.add('sticky');
                document.body.style.paddingTop = navbarHeight + 'px';
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
    }

    window.addEventListener('scroll', handleScroll);

    navbar.addEventListener('mouseenter', () => {
        if (navbar.classList.contains('sticky')) {
            navbar.classList.remove('hidden');
        }
    });

    navbar.addEventListener('mouseleave', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (navbar.classList.contains('sticky') && scrollTop > headerHeight) {
            navbar.classList.add('hidden');
        }
    });
}