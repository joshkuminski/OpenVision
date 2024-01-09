call %~dp0\venv\Scripts\activate
@echo off
setlocal

REM Check if the nvidia-smi command is available
where nvidia-smi >nul 2>nul
if %errorlevel% equ 0 (
    echo GPU is available.

    setlocal enabledelayedexpansion

    for /f "tokens=1,2 delims=," %%i in ('nvidia-smi --query-gpu=index,name --format=csv,noheader,nounits') do (
        set /a index=%%i
        set name=%%j
        set device=index
        echo GPU !index!: !name!
    )
    nvidia-smi
) else (
    echo GPU is not available or nvidia-smi is not installed.
    set device="cpu"
)

endlocal

python %~dp0SetProject.py
set /p FileName=<./Input_Data/Filename.json
set /p ProjectName=<./Input_Data/Projectname.json

python %~dp0OV_track.py --source ./Open-Vision/video/EXAMPLE.mp4 --device "%device%" --project "%ProjectName%"--name "%FileName%" --save-vid --strong-sort-weights ./weights/osnet_x1_0_market1501.pt --yolo-weights ./weights/yolov7-OVcustom-v1_4.pt --classes 0 1 2 5
timeout /T 15
deactivate
