@echo off
rem ============================================================
rem  GOFFICE2026 - Green Office Data Sync (manual one-click)
rem  ============================================================
rem  Runs the verified wrapper scripts\sync-scheduled.ps1 (GO-DATA-4),
rem  then shows the final status: SUCCESS / NO CHANGE / FAILED
rem  (or ALREADY RUNNING when the daily 18:30 task or another
rem  manual run holds the lock), plus the log path.
rem  - No backend / no web-triggered execution.
rem  - OneDrive source stays read-only.
rem  - Scheduled task GOFFICE2026-DataSync-Daily is untouched.
rem ============================================================
setlocal
chcp 65001 >nul
title Green Office Data Sync (manual)
color 0B

set "WRAPPER=G:\ProjectAI\goffice2026\scripts\sync-scheduled.ps1"
set "LOG=G:\ProjectAI\goffice2026\logs\data-sync.log"

echo ============================================================
echo   Green Office Data Sync - manual run
echo ============================================================
echo.

cd /d G:\ProjectAI\goffice2026

rem --- run the verified wrapper (reuses existing lock + logging) ---
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%WRAPPER%"
set "RC=%ERRORLEVEL%"

rem --- read the last RESULT/SKIP line from the wrapper log ---
set "RESULT_LINE="
for /f "delims=" %%L in ('powershell.exe -NoProfile -Command "$l = Get-Content -LiteralPath '%LOG%' -ErrorAction SilentlyContinue | Where-Object { $_ -match 'RESULT|SKIP' } | Select-Object -Last 1; if ($l) { $l }"') do set "RESULT_LINE=%%L"

set "STATUS="
if defined RESULT_LINE (
  echo %RESULT_LINE% | findstr /C:"SKIP" >nul && set "STATUS=ALREADY RUNNING (skipped)"
)
if not defined STATUS (
  if defined RESULT_LINE (
    echo %RESULT_LINE% | findstr /C:"change=NO" >nul && set "STATUS=NO CHANGE"
  )
)
if not defined STATUS (
  if "%RC%"=="0" (set "STATUS=SUCCESS") else (set "STATUS=FAILED")
)

echo.
echo ============================================================
if "%STATUS%"=="SUCCESS"   color 0A
if "%STATUS%"=="NO CHANGE" color 0E
if "%STATUS%"=="FAILED"    color 0C
echo   Final status : %STATUS%  (exit code %RC%)
echo   Log path     : %LOG%
echo ============================================================
if defined RESULT_LINE echo   Last result : %RESULT_LINE%
echo.
pause
