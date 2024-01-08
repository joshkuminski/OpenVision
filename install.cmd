echo Install OpenVision.
@echo off

rem Check if Git is already installed
git --version >nul 2>&1
if %errorlevel% == 0 (
    echo Git is already installed.
) else (
    echo Installing Git...
    rem Install Chocolatey if not already installed
    if not exist "%SystemRoot%\System32\chocolatey" (
        @powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
    )
    rem Install Git using Chocolatey
    choco install git -y
    rem Check the Git version
    git --version
)

set "desired_version=3.8.10"
rem Check if Python is already installed
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo python already installed.
    echo Upgrading Python...
    choco upgrade python --version "%desired_version%" -y
) else (
    for /f "tokens=2" %%A in ('python --version 2^>^&1') do (
            set "installed_version=%%A"
        )
    rem Compare the installed version with the desired version
    if "%installed_version%" equ "%desired_version%" (
        echo Python %desired_version% is installed.
    ) else (
        echo Installing Python...
        rem Install Python 3.8 using Chocolatey
        choco install python --version "%desired_version%" --side-by-side -y
        rem Check the Python version
        python --version
    )
)

echo Git and Python installation is complete.

setlocal

rem Get the full path of the script's directory
set "script_dir=%~dp0"
set "YoloOSNET=Yolov7_StrongSORT_OSNet"
set "YoloOSNET_directory=%script_dir%%YoloOSNET%"

rem Set the repository URLs
set YoloOSNET_url=https://github.com/joshkuminski/Yolov7_StrongSORT_OSNet.git
set Yolov7_url=https://github.com/joshkuminski/yolov7.git
set REID_url=https://github.com/joshkuminski/deep-person-reid.git

rem Clone the Git repository
git clone "%YoloOSNET_url%"

cd /d "%YoloOSNET_directory%"
echo %Yolov7_directory%
git clone "%Yolov7_url%"

set "REID=\strong_sort\deep\reid"
set "REID_directory=%script_dir%%YoloOSNET%%REID%"

if not exist "%REID_directory%" mkdir "%REID_directory%"
cd /d "%REID_directory%"
git clone "%REID_url%"

cd /d "%script_dir%"

endlocal

rem UPGRADE PIP AND INSTALL REQUIREMENTS
python -m venv venv
call venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir%

rem Put your videos in ./Open-Vision/video
rem python %~dp0Set_Img.py

timeout /t 15 /nobreak
deactivate
