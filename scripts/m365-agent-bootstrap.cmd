@echo off
setlocal EnableExtensions
REM Green Office 2026 — M365 agent bootstrap CMD wrapper
REM Usage:
REM   scripts\m365-agent-bootstrap.cmd
REM   scripts\m365-agent-bootstrap.cmd researchmju
REM   scripts\m365-agent-bootstrap.cmd prinya
REM   scripts\m365-agent-bootstrap.cmd researchmju -CheckOnly

set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%m365-agent-bootstrap.ps1"

if not exist "%PS_SCRIPT%" (
  echo STATUS=CONFIGURATION_ERROR
  echo Missing m365-agent-bootstrap.ps1
  exit /b 5
)

set "ACCOUNT=researchmju"
if /I "%~1"=="prinya" (
  set "ACCOUNT=prinya"
  shift
)
if /I "%~1"=="researchmju" shift

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" -Account %ACCOUNT% %*
exit /b %ERRORLEVEL%
