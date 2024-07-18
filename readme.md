# Joachim Rayski's Portfolio Website

## Overview
This project is a personal portfolio website for Joachim Rayski, a game developer and musician. It showcases Joachim's work through an interactive project browser and includes an immersive music player featuring original compositions.

## Features
- Responsive design for desktop and mobile devices
- Interactive navigation with smooth scrolling and hide/show functionality
- Retro browser-like project showcase with fullscreen capability
- Projects categorized into "First Steps," "College," and "University" sections
- Embedded content preview for projects (YouTube videos, itch.io games)
- Custom ToneZone music player with audio visualizer and fullscreen mode
- Animated section transitions and hover effects
- Immersive space-themed background

## Project Structure
- `index.html`: Main page of the website
- `tonezone-player.html`: Dedicated page for the ToneZone music player
- `css/`
  - `main.css`: Main stylesheet for shared styles
  - `index.css`: Styles specific to the index page, including retro browser UI
  - `tonezone.css`: Styles specific to the ToneZone player page
- `js/`
  - `index-script.js`: JavaScript for the main page functionality, including the retro browser-like project showcase
  - `tonezone-script.js`: JavaScript for the ToneZone player functionality
- `music/`: Directory containing all music files (mp3 format)
- `images/`: Directory containing images used in the website

## Technologies Used
- HTML5
- CSS3 (with CSS variables for easy theming and responsive design)
- JavaScript (ES6+)
- Web Audio API (for audio visualizer)

## Setup and Usage
1. Ensure all music files are placed in the `music` folder
2. Host the files on a web server or open `index.html` in a web browser

## Recent Improvements
- Fixed volume slider functionality on mobile devices
- Added fullscreen mode for the ToneZone player
- Improved audio visualizer responsiveness when rotating mobile devices
- Fixed issues with the audio visualizer display on device rotation

## Known Issues
- No major known issues at this time

## Future Improvements
- Implement lazy loading for embedded content in the project showcase
- Add keyboard navigation support for the retro browser interface
- Optimize performance for slower internet connections
- Enhance the audio visualizer with more advanced effects and user controls

## Contributing
This is a personal project, but suggestions and feedback are welcome. Please report any bugs or issues you encounter.

## License
[Specify your license here]