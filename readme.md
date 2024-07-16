# Joachim Rayski's Portfolio Website

## Overview
This project is a personal portfolio website for Joachim Rayski, a game developer and musician. It showcases Joachim's work, provides information about his background, and includes an immersive music player featuring original compositions.

## Features
- Responsive design
- Interactive navigation
- Game showcase section with embedded YouTube videos
- Custom music player with visualizer
- Dynamic star background for immersive effect

## File Structure
- `index.html`: Main page of the website
- `music-player.html`: Dedicated page for the music player
- `styles.css`: Main stylesheet for the entire website
- `index-script.js`: JavaScript for the main page functionality
- `music-player-script.js`: JavaScript for the music player functionality
- `music.json`: List of music tracks for the player
- `generate_music_json.bat`: Batch script to generate the music.json file

## Technologies Used
- HTML5
- CSS3
- JavaScript (ES6+)
- Web Audio API (for music visualizer)

## Setup and Installation
1. Clone the repository to your local machine.
2. Ensure you have a web server set up (e.g., Apache, Nginx, or a simple Python server).
3. Place your MP3 files in the `music` folder.
4. Run the `generate_music_json.bat` script to create the `music.json` file.
5. Open `index.html` in a web browser to view the main page.

## Music Player
The custom music player features:
- Play, pause, next, and previous controls
- Progress bar with seek functionality
- Volume control
- Dynamic playlist generated from `music.json`
- Audio visualizer using Web Audio API

## Customization
- Update the content in `index.html` to reflect your personal information and projects.
- Modify `styles.css` to change the color scheme and layout.
- Add your own MP3 files to the `music` folder and update `music.json` accordingly.

## Notes for Future Development
- Consider adding more interactive elements to the game showcase section.
- Implement a contact form in the contact section.
- Optimize images and assets for faster loading times.
- Add more advanced visualizations or themes to the music player.
- Implement a backend for dynamic content management.

## Credits
This project was created by Joachim Rayski. All game footage and music are original creations unless otherwise stated.

## License
[Specify the license under which this project is released, e.g., MIT, GPL, etc.]
