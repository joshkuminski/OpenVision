echo OpenVision: gpu requirements.
@echo off
FOR /F "tokens=* USEBACKQ" %%F IN (`python --version`) DO SET PYTHON_VERSION=%%F

echo %PYTHON_VERSION%
if "x%PYTHON_VERSION:3.8=%"=="x%PYTHON_VERSION%" (
    echo "Python Version 3.8 is not installed in environment." & cmd /K & exit
)

python -m venv venv
call venv\Scripts\activate
python -m pip install --upgrade pip
pip uninstall torch
pip uninstall torchvision
pip install -r requirements_gpu.txt --no-cache-dir%
deactivate
