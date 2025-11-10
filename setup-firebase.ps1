# Firebase Setup Helper for TurboType Rally
# PowerShell Script

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Firebase Setup Helper" -ForegroundColor Cyan
Write-Host "  TurboType Rally - InnoviTecho" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/4] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "  ✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Node.js NOT installed" -ForegroundColor Red
    Write-Host "  → Download from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to open Node.js download page..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Start-Process "https://nodejs.org/"
    exit
}
Write-Host ""

# Check npm
Write-Host "[2/4] Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "  ✓ npm is available: $npmVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ npm NOT found" -ForegroundColor Red
}
Write-Host ""

# Check Firebase CLI
Write-Host "[3/4] Checking Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>$null
    if ($firebaseVersion) {
        Write-Host "  ✓ Firebase CLI is installed: $firebaseVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Firebase CLI NOT installed" -ForegroundColor Red
    Write-Host ""
    $install = Read-Host "  Would you like to install Firebase CLI now? (Y/N)"
    if ($install -eq "Y" -or $install -eq "y") {
        Write-Host ""
        Write-Host "  Installing Firebase CLI..." -ForegroundColor Yellow
        npm install -g firebase-tools
        Write-Host "  ✓ Firebase CLI installed!" -ForegroundColor Green
    } else {
        Write-Host "  Skipping installation" -ForegroundColor Yellow
        Write-Host "  (Install later with: npm install -g firebase-tools)" -ForegroundColor Gray
    }
}
Write-Host ""

# Check Firebase config
Write-Host "[4/4] Checking Firebase config..." -ForegroundColor Yellow
$appJsPath = "typing-rally\app.js"
if (Test-Path $appJsPath) {
    $content = Get-Content $appJsPath -Raw
    if ($content -match "YOUR_API_KEY_HERE") {
        Write-Host "  ✗ Firebase config NOT set up yet" -ForegroundColor Red
        Write-Host "  → Follow FIREBASE_SETUP.md to configure" -ForegroundColor Yellow
    } elseif ($content -match "apiKey:") {
        Write-Host "  ✓ Firebase config appears to be set!" -ForegroundColor Green
        
        # Try to extract project info
        if ($content -match 'projectId:\s*["\']([^"\']+)["\']') {
            Write-Host "    Project ID: $($matches[1])" -ForegroundColor Cyan
        }
        if ($content -match 'databaseURL:\s*["\']([^"\']+)["\']') {
            Write-Host "    Database URL: $($matches[1])" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "  ✗ typing-rally/app.js not found" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Create Firebase project at: https://console.firebase.google.com/" -ForegroundColor White
Write-Host "2. Enable Realtime Database (test mode)" -ForegroundColor White
Write-Host "3. Get your config and update typing-rally/app.js" -ForegroundColor White
Write-Host "4. Test locally (see below)" -ForegroundColor White
Write-Host "5. Commit and push to deploy!" -ForegroundColor White
Write-Host ""

Write-Host "Quick Test (choose one):" -ForegroundColor Yellow
Write-Host "  → python -m http.server 8080" -ForegroundColor Gray
Write-Host "  → php -S localhost:8080" -ForegroundColor Gray
Write-Host "  → npx http-server -p 8080" -ForegroundColor Gray
Write-Host ""
Write-Host "Then open: http://localhost:8080/typing-rally/" -ForegroundColor Cyan
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  → FIREBASE_SETUP.md (detailed instructions)" -ForegroundColor Gray
Write-Host "  → TURBOTYPE_SETUP.md (game overview)" -ForegroundColor Gray
Write-Host ""

# Offer to open Firebase Console
Write-Host "Would you like to open Firebase Console now? (Y/N)" -ForegroundColor Yellow
$openConsole = Read-Host
if ($openConsole -eq "Y" -or $openConsole -eq "y") {
    Start-Process "https://console.firebase.google.com/"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🏎️ Ready to race!" -ForegroundColor Green
Write-Host "Live URL: https://innovitecho.com/typing-rally/" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Keep window open
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
