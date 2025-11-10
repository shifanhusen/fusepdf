@echo off
echo.
echo ========================================
echo   Firebase Setup Helper
echo   TurboType Rally - InnoviTecho
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/4] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   X Node.js NOT installed
    echo   - Download from: https://nodejs.org/
    echo.
    goto :no_node
) else (
    node --version
    echo   + Node.js is installed!
    echo.
)

REM Check if npm is available
echo [2/4] Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   X npm NOT found
    echo.
) else (
    npm --version
    echo   + npm is available!
    echo.
)

REM Check Firebase CLI
echo [3/4] Checking Firebase CLI...
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   X Firebase CLI NOT installed
    echo.
    echo   Would you like to install Firebase CLI now? (Y/N)
    set /p install_choice=
    if /i "%install_choice%"=="Y" (
        echo.
        echo   Installing Firebase CLI...
        npm install -g firebase-tools
        echo   + Firebase CLI installed!
        echo.
    ) else (
        echo   Skipping Firebase CLI installation
        echo   (You can install later with: npm install -g firebase-tools)
        echo.
    )
) else (
    firebase --version
    echo   + Firebase CLI is installed!
    echo.
)

REM Check Firebase config
echo [4/4] Checking Firebase config in typing-rally/app.js...
findstr /C:"YOUR_API_KEY_HERE" typing-rally\app.js >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo   X Firebase config NOT set up yet
    echo   - Follow FIREBASE_SETUP.md to configure
    echo.
) else (
    echo   + Firebase config appears to be set!
    echo.
)

echo ========================================
echo   Setup Summary
echo ========================================
echo.
echo Next Steps:
echo 1. Create Firebase project at: https://console.firebase.google.com/
echo 2. Enable Realtime Database
echo 3. Copy config to typing-rally/app.js
echo 4. Test locally with a server
echo 5. Commit and push to deploy!
echo.
echo For detailed instructions, see:
echo - FIREBASE_SETUP.md
echo - TURBOTYPE_SETUP.md
echo.
echo ========================================
pause
exit

:no_node
echo.
echo To use Firebase CLI, you need Node.js installed.
echo.
echo Option 1 (Recommended): Use Firebase Console
echo - Follow FIREBASE_SETUP.md Option 1
echo - No installation required!
echo - Setup in 5 minutes via web browser
echo.
echo Option 2: Install Node.js first
echo - Download from: https://nodejs.org/
echo - Then run this script again
echo.
echo ========================================
pause
