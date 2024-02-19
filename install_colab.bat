echo Install OpenVision for Colab.
@echo off

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

echo Python installation is complete.
echo Creating Virtual Environment...
rem UPGRADE PIP AND INSTALL REQUIREMENTS
python -m venv venv
call venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements_colab.txt --no-cache-dir%

timeout /t 15 /nobreak
deactivate
