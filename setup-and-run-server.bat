@echo off
setlocal enabledelayedexpansion

:: Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Python is not installed or not in the system PATH.
    echo Please install Python from https://www.python.org/downloads/
    echo Ensure you check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

:: Get Python version
for /f "tokens=2 delims=." %%v in ('python --version 2^>^&1') do set python_major_version=%%v

:: Set the correct Python HTTP server command based on version
if %python_major_version% geq 3 (
    set server_command=python -m http.server 8000
) else (
    set server_command=python -m SimpleHTTPServer 8000
)

:: Navigate to the project root directory
cd /d %~dp0

:: Generate music.json file
echo Generating music.json file...

:: Define the folder containing the music files
set "music_folder=music"

:: Create or overwrite the music.json file
echo [ > music.json

:: Initialize the JSON array
set first=true

:: Loop through all mp3 files in the music folder
for %%f in (%music_folder%\*.mp3) do (
    if "!first!"=="true" (
        echo "%%~nxf" >> music.json
        set first=false
    ) else (
        echo ,"%%~nxf" >> music.json
    )
)

:: Close the JSON array
echo ] >> music.json

echo music.json file has been generated.

:: Start the server in a new command prompt window
start cmd /k %server_command%

:: Wait for a moment to ensure the server has started
timeout /t 2 >nul

:: Open the default web browser with cache-clearing flags
start "" "http://localhost:8000/?nocache=%RANDOM%"

echo Local server started. A new browser window should open automatically.
echo To stop the server, close the command prompt window that was opened.
pause

endlocal