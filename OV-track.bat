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
        echo GPU !index!: !name!
    )
    nvidia-smi
) else (
    echo GPU is not available or nvidia-smi is not installed.
)

endlocal

python %~dp0\OV_track.py --source ./Open-Vision/video/EXAMPLE.mp4 --device 0 --project "New Project" --name "Name" --save-vid --strong-sort-weights ./weights/osnet_x1_0_market1501.pt
timeout /T 15
deactivate
