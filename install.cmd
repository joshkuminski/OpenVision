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

rem Check if Python is already installed
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python is already installed.
) else (
    echo Installing Python...
    rem Install Python 3.8 using Chocolatey
    choco install python --version 3.8 -y
    rem Check the Python version
    python --version
)

echo.
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



python -m venv venv
call venv\Scripts\activate
rem python -m pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir%
timeout /t 15 /nobreak
deactivate

https://github.com/joshkuminski/OpenVision/releases/download/v1.4/yolov7-OVcustom-v1_4.pt