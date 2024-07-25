document.addEventListener('DOMContentLoaded', () => {
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
            embed: '<iframe src="https://itch.io/embed/345531" width="552" height="167" frameborder="0"><a href="https://priestleycgd.itch.io/a-bapwac-christmas-tale">A Bapwac Christmas Tale by PriestleyCGD</a></iframe>',
            link: "https://priestleycgd.itch.io/a-bapwac-christmas-tale",
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
            link: "https://fito300.itch.io/ace-cuppa",
            embed: '<iframe src="https://itch.io/embed/268773" width="552" height="167" frameborder="0"><a href="https://fito300.itch.io/ace-cuppa">Ace Cuppa by Fito300</a></iframe>',
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

    const createProjectTabs = () => {
        const tabContainer = document.querySelector('.project-tabs');
        tabContainer.innerHTML = '';

        const categories = ["First Steps", "College", "University"];
        
        categories.forEach(category => {
            const tabSection = document.createElement('div');
            tabSection.className = 'tab-section';
            
            const categoryHeader = document.createElement('h3');
            categoryHeader.textContent = category;
            tabSection.appendChild(categoryHeader);

            const projectTabs = document.createElement('div');
            projectTabs.className = 'project-tabs-inner';

            projects.filter(project => project.category === category).forEach((project, index) => {
                const tab = document.createElement('button');
                tab.className = 'project-tab';
                tab.textContent = project.title;
                tab.setAttribute('aria-label', `View ${project.title}`);
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    showProjectContent(projects.indexOf(project));
                });
                projectTabs.appendChild(tab);
            });

            tabSection.appendChild(projectTabs);
            tabContainer.appendChild(tabSection);
        });
    };

    let currentProjectLinkHandler = null;

    const showProjectContent = (index) => {
        const project = projects[index];
        const tabs = document.querySelectorAll('.project-tab');
        tabs.forEach((tab, i) => {
            const isActive = i === index;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
        });

        const currentProject = document.getElementById('current-project');

        const handleClick = () => {
            if (project.link) {
                window.open(project.link, '_blank', 'noopener,noreferrer');
            }
        };

        if (currentProjectLinkHandler) {
            currentProject.removeEventListener('click', currentProjectLinkHandler);
        }

        if (project.link) {
            currentProject.textContent = project.link;
            currentProject.style.cursor = 'pointer';
            currentProjectLinkHandler = handleClick;
            currentProject.addEventListener('click', currentProjectLinkHandler);
            currentProject.setAttribute('role', 'button');
            currentProject.setAttribute('aria-label', `Open ${project.title} in a new tab`);
        } else {
            currentProject.textContent = project.title.toLowerCase().replace(/ /g, '-');
            currentProject.style.cursor = 'default';
            currentProject.removeAttribute('role');
            currentProject.removeAttribute('aria-label');
        }

        if (project.isDrive) {
            showDriveLink(project.link, project.title);
        } else if (project.embed) {
            showEmbed(project.embed);
        } else if (project.link) {
            showPreview(project.link);
        } else {
            clearPreview();
        }
    };

    const showPreview = (url) => {
        const previewFrame = document.getElementById('preview-frame');
        const previewLink = document.getElementById('preview-link');
        const embedContainer = document.getElementById('embed-container');
        
        previewFrame.style.display = 'block';
        previewLink.style.display = 'none';
        embedContainer.style.display = 'none';
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('youtube.com') ? url.split('v=')[1] : url.split('/').pop();
            const ampersandPosition = videoId.indexOf('&');
            if (ampersandPosition !== -1) {
                videoId = videoId.substring(0, ampersandPosition);
            }
            
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            previewFrame.src = embedUrl;
        } else {
            previewFrame.src = url;
        }
    };

    const showEmbed = (embedCode) => {
        const previewFrame = document.getElementById('preview-frame');
        const previewLink = document.getElementById('preview-link');
        const embedContainer = document.getElementById('embed-container');
    
        previewFrame.style.display = 'none';
        previewLink.style.display = 'none';
        embedContainer.style.display = 'flex';
    
        // Remove inline styles from the iframe
        embedCode = embedCode.replace(/style="[^"]*"/g, '');
    
        embedContainer.innerHTML = embedCode;
    };
    
    const showDriveLink = (url, text) => {
        const previewFrame = document.getElementById('preview-frame');
        const previewLink = document.getElementById('preview-link');
        const embedContainer = document.getElementById('embed-container');
        previewFrame.style.display = 'none';
        previewLink.style.display = 'block';
        embedContainer.style.display = 'none';
        previewLink.href = url;
        previewLink.textContent = `View ${text}`;
        previewLink.setAttribute('aria-label', `View ${text} on Google Drive`);
    };

    const clearPreview = () => {
        const previewFrame = document.getElementById('preview-frame');
        const previewLink = document.getElementById('preview-link');
        const embedContainer = document.getElementById('embed-container');
        previewFrame.style.display = 'none';
        previewLink.style.display = 'none';
        embedContainer.style.display = 'none';
        previewFrame.src = '';
        embedContainer.innerHTML = '';
    };

    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    const projectBrowser = document.getElementById('project-browser');
    let isIOSFullscreen = false;
    let scrollPositionBeforeFullscreen = 0;

    const toggleFullscreen = () => {
        if (isIOS()) {
            toggleIOSFullscreen();
        } else {
            toggleDesktopFullscreen();
        }
    };

    const isIOS = () => {
        return /iPhone|iPod|iPad/.test(navigator.userAgent);
    };

    const toggleIOSFullscreen = () => {
        if (!isIOSFullscreen) {
            scrollPositionBeforeFullscreen = window.pageYOffset;
        }
        isIOSFullscreen = !isIOSFullscreen;
        if (isIOSFullscreen) {
            projectBrowser.classList.add('fullscreen');
            document.body.style.overflow = 'hidden';
            window.scrollTo(0, 0);
        } else {
            projectBrowser.classList.remove('fullscreen');
            document.body.style.overflow = '';
            window.scrollTo(0, scrollPositionBeforeFullscreen);
        }
        updateFullscreenButton();
    };

    const toggleDesktopFullscreen = () => {
        if (!document.fullscreenElement) {
            enterFullscreen();
        } else {
            exitFullscreen();
        }
    };

    const enterFullscreen = () => {
        if (projectBrowser.requestFullscreen) {
            projectBrowser.requestFullscreen();
        } else if (projectBrowser.mozRequestFullScreen) {
            projectBrowser.mozRequestFullScreen();
        } else if (projectBrowser.webkitRequestFullscreen) {
            projectBrowser.webkitRequestFullscreen();
        } else if (projectBrowser.msRequestFullscreen) {
            projectBrowser.msRequestFullscreen();
        }
    };

    const exitFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    };

    const updateFullscreenButton = () => {
        const isFullscreen = document.fullscreenElement || isIOSFullscreen;
        projectBrowser.classList.toggle('fullscreen', isFullscreen);
        fullscreenToggle.setAttribute('aria-label', isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
    };

    fullscreenToggle.addEventListener('mousedown', () => {
        fullscreenToggle.classList.add('active');
    });

    fullscreenToggle.addEventListener('mouseup', () => {
        fullscreenToggle.classList.remove('active');
    });

    fullscreenToggle.addEventListener('mouseleave', () => {
        fullscreenToggle.classList.remove('active');
    });

    fullscreenToggle.addEventListener('click', toggleFullscreen);

    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && (document.fullscreenElement || isIOSFullscreen)) {
            if (isIOS()) {
                toggleIOSFullscreen();
            } else {
                exitFullscreen();
            }
        }
    });

    // Handle orientation change for iOS fullscreen
    window.addEventListener('orientationchange', () => {
        if (isIOS() && isIOSFullscreen) {
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 50);
        }
    });

    // Initialize project browser
    createProjectTabs();
    showProjectContent(0);

    // Prevent default behavior for tab clicks
    document.querySelectorAll('.project-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });

    // Add keyboard navigation for project tabs
    const handleTabKeyNavigation = (e) => {
        const tabs = Array.from(document.querySelectorAll('.project-tab'));
        const currentTab = document.activeElement;
        const currentIndex = tabs.indexOf(currentTab);

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % tabs.length;
            tabs[nextIndex].focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            tabs[prevIndex].focus();
        }
    };

    document.querySelector('.project-tabs').addEventListener('keydown', handleTabKeyNavigation);

    // Lazy load images and iframes
    const lazyLoadElements = () => {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const lazyIframes = document.querySelectorAll('iframe[data-src]');

        const lazyLoad = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    element.src = element.dataset.src;
                    element.removeAttribute('data-src');
                    observer.unobserve(element);
                }
            });
        };

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver(lazyLoad, observerOptions);

        lazyImages.forEach(img => observer.observe(img));
        lazyIframes.forEach(iframe => observer.observe(iframe));
    };

    // Call lazyLoadElements when the page loads and when content changes
    lazyLoadElements();
    const mutationObserver = new MutationObserver(lazyLoadElements);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Improve accessibility
    const improveAccessibility = () => {
        // Add ARIA labels and roles to relevant elements
        document.querySelectorAll('.project-tab').forEach(tab => {
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', 'false');
        });

        document.querySelector('.project-tabs').setAttribute('role', 'tablist');
    };

    // Call improveAccessibility after the page loads
    improveAccessibility();
});