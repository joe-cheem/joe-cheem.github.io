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

    // Project browser functionality
    const projectTabs = document.querySelector('.project-tabs');
    const currentProject = document.getElementById('current-project');

    const projects = [
        {
            title: "The Light",
            description: "My first game project.",
            link: "https://gamejolt.com/games/the-light/50621",
            category: "First Steps"
        },
        {
            title: "A Bapwac Christmas Tale",
            description: "Game Jam project created during college.",
            embed: '<iframe height="167" frameborder="0" src="https://itch.io/embed/345531" width="552"><a href="https://priestleycgd.itch.io/a-bapwac-christmas-tale">A Bapwac Christmas Tale by PriestleyCGD</a></iframe>',
            category: "College"
        },
        {
            title: "Meteor Knights",
            description: "BAFTA YGD project.",
            link: "https://gamejolt.com/games/meteor_knights/262640",
            category: "College"
        },
        {
            title: "Ace Cuppa",
            description: "Final Major Project for college.",
            embed: '<iframe width="552" height="167" frameborder="0" src="https://itch.io/embed/268773"><a href="https://fito300.itch.io/ace-cuppa">Ace Cuppa by Fito300</a></iframe>',
            category: "College"
        },
        {
            title: "Ace Cuppa Project Files",
            description: "Project files for Ace Cuppa.",
            link: "https://drive.google.com/file/d/13SnfGdrqOmZmc3f24kqhavIDcyvGzTEt/view?usp=sharing",
            isDrive: true,
            category: "College"
        },
        {
            title: "Super Micro Bot Bear Surgery Ultimate",
            description: "University project.",
            link: "https://www.youtube.com/watch?v=vV-4H7phuCk",
            category: "University"
        },
        {
            title: "Zeus VR",
            description: "University project.",
            link: "https://www.youtube.com/watch?v=5umvRvRZCL8",
            category: "University"
        },
        {
            title: "University Project Files",
            description: "Collection of university project files.",
            link: "https://drive.google.com/file/d/1ih_FCpCB2L8WQ865XlVzer47abgBVDx7/view?usp=sharing",
            isDrive: true,
            category: "University"
        }
    ];

    function createProjectTabs() {
        const categories = {
            "First Steps": document.querySelector('.tab-section:nth-child(1)'),
            "College": document.querySelector('.tab-section:nth-child(2)'),
            "University": document.querySelector('.tab-section:nth-child(3)')
        };

        projects.forEach((project, index) => {
            const tab = document.createElement('button');
            tab.className = 'project-tab';
            tab.textContent = project.title;
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                showProjectContent(index);
            });
            categories[project.category].appendChild(tab);
        });
    }

    function showProjectContent(index) {
        const project = projects[index];
        const tabs = document.querySelectorAll('.project-tab');
        tabs.forEach((tab, i) => {
            if (i === index) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        currentProject.textContent = project.title.toLowerCase().replace(/ /g, '-');

        // Show preview or link
        if (project.isDrive) {
            showDriveLink(project.link, project.title);
        } else if (project.embed) {
            showEmbed(project.embed);
        } else if (project.link) {
            showPreview(project.link);
        } else {
            clearPreview();
        }
    }

    function showPreview(url) {
        const previewFrame = document.getElementById('preview-frame');
        const previewLink = document.getElementById('preview-link');
        const embedContainer = document.getElementById('embed-container');
        
        previewFrame.style.display = 'block';
        previewLink.style.display = 'none';
        embedContainer.style.display = 'none';
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            // Extract video ID from YouTube URL
            let videoId = url.split('v=')[1];
            if (!videoId) {
                videoId = url.split('/').pop();
            }
            const ampersandPosition = videoId.indexOf('&');
            if (ampersandPosition !== -1) {
                videoId = videoId.substring(0, ampersandPosition);
            }
            
            // Create YouTube embed URL
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            previewFrame.src = embedUrl;
        } else {
            previewFrame.src = url;
        }
    }

    function showEmbed(embedCode) {
        const previewFrame = document.getElementById('preview-frame');
        const previewLink = document.getElementById('preview-link');
        const embedContainer = document.getElementById('embed-container');
        previewFrame.style.display = 'none';
        previewLink.style.display = 'none';
        embedContainer.style.display = 'block';
        embedContainer.innerHTML = embedCode;
    }

    function showDriveLink(url, text) {
        const previewFrame = document.getElementById('preview-frame');
        const previewLink = document.getElementById('preview-link');
        const embedContainer = document.getElementById('embed-container');
        previewFrame.style.display = 'none';
        previewLink.style.display = 'block';
        embedContainer.style.display = 'none';
        previewLink.href = url;
        previewLink.textContent = `View ${text}`;
    }

    function clearPreview() {
        const previewFrame = document.getElementById('preview-frame');
        const previewLink = document.getElementById('preview-link');
        const embedContainer = document.getElementById('embed-container');
        previewFrame.style.display = 'none';
        previewLink.style.display = 'none';
        embedContainer.style.display = 'none';
        previewFrame.src = '';
        embedContainer.innerHTML = '';
    }

    // Fullscreen functionality
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    const projectBrowser = document.getElementById('project-browser');

    fullscreenToggle.addEventListener('click', () => {
        projectBrowser.classList.toggle('fullscreen');
        if (projectBrowser.classList.contains('fullscreen')) {
            fullscreenToggle.style.transform = 'scale(0.8)';
        } else {
            fullscreenToggle.style.transform = 'scale(1)';
        }
    });

    // Allow exiting fullscreen with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectBrowser.classList.contains('fullscreen')) {
            projectBrowser.classList.remove('fullscreen');
            fullscreenToggle.style.transform = 'scale(1)';
        }
    });

    // Initialize project browser
    createProjectTabs();
    showProjectContent(0);

    // Make showPreview function globally accessible
    window.showPreview = showPreview;

    // Prevent default behavior for tab clicks
    document.querySelectorAll('.project-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });

    // Initial call to set navbar position
    handleScroll();
});