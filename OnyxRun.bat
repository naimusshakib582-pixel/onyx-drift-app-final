@echo off
title OnyxDrift Neural Server
color 0b

echo ==========================================
echo    ONYXDRIFT NEURAL LINK STARTING...
echo ==========================================
echo [SYSTEM] Checking environment...

:: ১. চেক করা হচ্ছে পোর্ট ১০০০০ কি অন্য কোথাও চলছে কি না
netstat -ano | findstr :10000 > nul
if %errorlevel% == 0 (
    echo [WARNING] Port 10000 is already in use. 
    echo [ACTION] Terminating old process...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :10000') do taskkill /f /pid %%a
)

:: ২. সার্ভার ফোল্ডারে প্রবেশ করা
if exist server (
    cd server
)

:: ৩. নোড মডিউল চেক করা
if not exist node_modules (
    echo [SYSTEM] node_modules not found. Installing dependencies...
    npm install
)

:: ৪. সার্ভার রান করা
echo [SUCCESS] Neural Core is ready.
echo [STATUS] Running on http://localhost:10000
echo ------------------------------------------
node index.js

pause