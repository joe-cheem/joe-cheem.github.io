# Joachim Rayski's Portfolio Website

## Overview
This project is a personal portfolio website for Joachim Rayski, a game developer and musician. It showcases Joachim's work, provides information about his background, and includes an immersive music player featuring original compositions.

## Features
- Responsive design for desktop and mobile devices
- Interactive navigation with smooth scrolling
- Game showcase section with embedded YouTube videos and download links
- Custom ToneZone music player with circular visualizer and touch controls

## Project Structure
- `index.html`: Main page of the website
- `tonezone-player.html`: Dedicated page for the ToneZone music player
- `styles.css`: Main stylesheet for the entire website
- `index-script.js`: JavaScript for the main page functionality
- `tonezone-script.js`: JavaScript for the ToneZone player functionality
- `music.json`: List of music tracks for the ToneZone player
- `generate_music_json.bat`: Batch script to generate the music.json file
- `music/`: Directory containing all music files (mp3 format)
- `images/`: Directory containing images used in the website (banner.png, background.png, overlay.png)

## Technologies Used
- HTML5
- CSS3
- JavaScript (ES6+)
- Web Audio API (for circular music visualizer)

## ToneZone Music Player
The custom ToneZone music player features:
- Responsive design for mobile and desktop
- Play, pause, next, and previous controls with touch support
- Progress bar with seek functionality
- Volume control
- Dynamic playlist generated from `music.json`
- Circular audio visualizer using Web Audio API
- Swipe gestures for mobile devices

## GitHub Pages Hosting
- This project is hosted on GitHub Pages
- The `main` branch is used for deployment
- Any changes pushed to the `main` branch will be automatically deployed to the live site

## Setup and Usage
1. Ensure all music files are placed in the `music` folder
2. Run `generate_music_json.bat` to update the `music.json` file whenever new music is added
3. Push changes to the `main` branch to update the live site

## Development Reminders
- Always test changes locally before pushing to the `main` branch
- Update `music.json` when adding or removing music files
- Optimize images and audio files for web performance
- Keep the circular visualizer performant by adjusting the `fftSize` if needed
- Ensure cross-browser compatibility, especially for the Web Audio API features

## Contributing
This is a personal project, but suggestions and feedback are welcome. Please open an issue to discuss any proposed changes.

## License
[MIT License](LICENSE)
