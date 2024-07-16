@echo off
setlocal enabledelayedexpansion

:: Define the folder containing the music files
set "music_folder=music"

:: Create or overwrite the music.json file
echo [ > music.json

:: Initialize the JSON array
set first=true

:: Loop through all mp3 files in the music folder
for %%f in (%music_folder%/*.mp3) do (
    if "!first!"=="true" (
        echo "%%f" >> music.json
        set first=false
    ) else (
        echo ,"%%f" >> music.json
    )
)

:: Close the JSON array
echo ] >> music.json

echo music.json file has been generated.
