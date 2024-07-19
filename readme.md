# Joachim Rayski's Portfolio Website

## Overview
This project is a personal portfolio website for Joachim Rayski, a game developer and musician. It showcases Joachim's work through an interactive project browser and includes an immersive music player featuring original compositions.

## Features
- Responsive design for desktop and mobile devices
- Interactive navigation with smooth scrolling and hide/show functionality
- Retro browser-like project showcase with fullscreen capability
- Projects categorized into "First Steps," "College," and "University" sections
- Embedded content preview for projects (YouTube videos, itch.io games)
- Custom ToneZone music player with text reveal effect and fullscreen mode
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
  - `common.js`: Common JavaScript functions used across the site
  - `index-script.js`: JavaScript for the main page functionality, including the retro browser-like project showcase
  - `tonezone-script.js`: JavaScript for the ToneZone player functionality
- `music/`: Directory containing all music files (mp3 format)
- `images/`: Directory containing images used in the website

## Technologies Used
- HTML5
- CSS3 (with CSS variables for easy theming and responsive design)
- JavaScript (ES6+)
- Web Audio API (for audio playback)

## Setup and Usage
1. Ensure all music files are placed in the `music` folder
2. Update the `music.json` file with the list of music files (you can use the `setup-and-run-server.bat` script to do this automatically)
3. Host the files on a web server or use the provided `setup-and-run-server.bat` script to start a local server

## Contributing
This is a personal project, but suggestions and feedback are welcome. Please report any bugs or issues you encounter.

## License
[Specify your license here]