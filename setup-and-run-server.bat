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

:: Generate project.txt file
echo Generating project.txt file...

:: Create or overwrite the project.txt file
(
    echo ================================================================
    echo                       PROJECT STRUCTURE
    echo ================================================================
    echo.
    echo ----------------------------------------------------------------
    echo                         ROOT DIRECTORY
    echo ----------------------------------------------------------------
    for %%F in (*.html *.css *.js *.md *.txt *.json *.bat) do (
        if "%%F" neq "project.txt" (
            echo.
            echo File: %%F
            echo --------------------------------
            type "%%F"
            echo.
            echo --------------------------------
            echo.
        )
    )
    
    if exist css (
        echo ----------------------------------------------------------------
        echo                         CSS DIRECTORY
        echo ----------------------------------------------------------------
        for %%F in (css\*.css) do (
            echo.
            echo File: %%F
            echo --------------------------------
            type "%%F"
            echo.
            echo --------------------------------
            echo.
        )
    )
    
    if exist js (
        echo ----------------------------------------------------------------
        echo                         JS DIRECTORY
        echo ----------------------------------------------------------------
        for %%F in (js\*.js) do (
            echo.
            echo File: %%F
            echo --------------------------------
            type "%%F"
            echo.
            echo --------------------------------
            echo.
        )
    )
    
    if exist images (
        echo ----------------------------------------------------------------
        echo                       IMAGES DIRECTORY
        echo ----------------------------------------------------------------
        echo.
        for %%F in (images\*) do echo %%F
        echo.
    )
    
    if exist music (
        echo ----------------------------------------------------------------
        echo                       MUSIC DIRECTORY
        echo ----------------------------------------------------------------
        echo.
        for %%F in (music\*.mp3) do echo %%F
        echo.
    )
    echo ================================================================
    echo                    END OF PROJECT STRUCTURE
    echo ================================================================
) > project.txt

echo project.txt file has been generated.

:: Start the server in a new command prompt window
start cmd /k %server_command%

:: Wait for a moment to ensure the server has started
timeout /t 2 >nul

:: Try to open in thorium
start "" thorium --incognito "http://localhost:8000"
if %errorlevel% equ 0 goto :end

:: Try to open in Chrome (incognito mode)
start "" chrome --incognito "http://localhost:8000"
if %errorlevel% equ 0 goto :end

:: If Chrome fails, try Firefox (private mode)
start "" firefox -private-window "http://localhost:8000"
if %errorlevel% equ 0 goto :end

:: If Firefox fails, try Edge (InPrivate mode)
start "" msedge -inprivate "http://localhost:8000"
if %errorlevel% equ 0 goto :end

:: If all browsers fail, provide instructions to the user
echo Unable to automatically open a browser.
echo Please open http://localhost:8000 manually in your preferred browser's private/incognito mode.

:end
echo Local server started. A browser window should open automatically in private/incognito mode.
echo If not, please open http://localhost:8000 manually in your preferred browser's private/incognito mode.
echo To stop the server, close the command prompt window that was opened.
pause

endlocal
