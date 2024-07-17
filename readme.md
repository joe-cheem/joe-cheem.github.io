# Joachim Rayski's Portfolio Website

## Overview
This project is a personal portfolio website for Joachim Rayski, a game developer and musician. It showcases Joachim's work, provides information about his background, and includes an immersive music player featuring original compositions.

## Features
- Responsive design for desktop and mobile devices, with improved mobile layout
- Interactive navigation with smooth scrolling and hide/show functionality, maintaining horizontal layout on mobile
- Game showcase section with embedded YouTube videos and descriptions
- Custom ToneZone music player with circular visualizer and touch controls
- Animated section transitions and hover effects
- Immersive space-themed background

## Project Structure
- `index.html`: Main page of the website
- `tonezone-player.html`: Dedicated page for the ToneZone music player
- `css/`
  - `main.css`: Main stylesheet for shared styles, including responsive design improvements
  - `index.css`: Styles specific to the index page
  - `tonezone.css`: Styles specific to the ToneZone player page
- `js/`
  - `index-script.js`: JavaScript for the main page functionality
  - `tonezone-script.js`: JavaScript for the ToneZone player functionality
- `music.json`: List of music tracks for the ToneZone player
- `generate_music_json.bat`: Batch script to generate the music.json file
- `music/`: Directory containing all music files (mp3 format)
- `images/`: Directory containing images used in the website (banner.png, background.png)

## Technologies Used
- HTML5
- CSS3 (with CSS variables for easy theming and responsive design)
- JavaScript (ES6+)
- Web Audio API (for circular music visualizer)

## ToneZone Music Player
The custom ToneZone music player features:
- Responsive design for mobile and desktop
- Play, pause, next, and previous controls
- Progress bar with seek functionality
- Volume control
- Dynamic playlist generated from `music.json`
- Circular audio visualizer using Web Audio API
- Touch-friendly controls for mobile devices

## Navbar Functionality
- Fixed position at the top of the page
- Hides partially when scrolling down, leaving a small part visible
- Fully visible when scrolling up or hovering
- Consistent appearance across different pages
- Maintains horizontal layout on mobile devices with adjusted spacing

## Responsive Design
- Adapts to various screen sizes (desktop, tablet, mobile)
- Adjusts layout, font sizes, and spacing for optimal viewing on different devices
- Uses media queries to apply specific styles for different screen widths
- Improved container width and padding for better mobile experience
- Navbar remains horizontal with adjusted spacing on smaller screens

## Animations and Visual Effects
- Fade-in animations for page sections
- Hover effects on interactive elements
- Immersive space-themed background

## Setup and Usage
1. Ensure all music files are placed in the `music` folder
2. Run `generate_music_json.bat` to update the `music.json` file whenever new music is added
3. Host the files on a web server or open `index.html` in a web browser

## Development Notes
- The website uses CSS variables for easy color scheme adjustments
- JavaScript is used for dynamic content loading and interactivity
- The audio visualizer is implemented using the Web Audio API
- Responsive design breakpoints are set at 768px and 480px

## Browser Compatibility
- The website is designed to work on modern browsers that support CSS3 and ES6+ JavaScript
- For the audio visualizer, browsers must support the Web Audio API

## Future Improvements
- Implement lazy loading for images and videos
- Add more interactive elements to the game showcase section
- Enhance the ToneZone player with additional features (e.g., playlists, shuffle)
- Optimize performance for slower internet connections
- Continue to refine responsive design for various device sizes and orientations

## Contributing
This is a personal project, but suggestions and feedback are welcome.