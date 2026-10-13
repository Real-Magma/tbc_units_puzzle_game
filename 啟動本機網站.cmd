@echo off
setlocal
cd /d "%~dp0"
set "PYTHON_EXE=%LocalAppData%\Programs\Python\Python313\python.exe"
if exist "%PYTHON_EXE%" (
    "%PYTHON_EXE%" py\serve_local_site.py
) else (
    python py\serve_local_site.py
)
if errorlevel 1 pause
