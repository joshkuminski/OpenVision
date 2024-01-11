call %~dp0\venv\Scripts\activate
@echo off
setlocal

REM Check if the nvidia-smi command is availablea
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

rem move the downloaded file to dir ./InputFiles
python %~dp0SetProject.py
set /p RunName=<./Input_Data/RunName.txt
set /p ProjectName=<./Input_Data/ProjectName.txt
set /p videoFile=<./Input_Data/FileName.txt

python %~dp0OV_track.py --source ./Open-Vision/video/"%videoFile%" --device "%device%" --project "%ProjectName%" --name "%RunName%" --save-vid --strong-sort-weights ./weights/osnet_x1_0_market1501.pt --yolo-weights ./weights/yolov7-OVcustom-v1_4.pt --classes 0 1 2 5
timeout /T 15
deactivate
