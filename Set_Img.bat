call %~dp0\venv\Scripts\activate
@echo off
rem Put your videos in ./Open-Vision/video
python %~dp0Set_Img.py
timeout /T 5
deactivate