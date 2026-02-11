# PrimePost Android APK Debug Build Script (Windows)
# This script builds the React web app and then builds a debug APK

$ErrorActionPreference = "Stop"

Write-Host "🚀 Building PrimePost Android APK (Debug)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if we're in the frontend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Must run from frontend directory" -ForegroundColor Red
    exit 1
}

# Step 1: Build the web app
Write-Host ""
Write-Host "📦 Step 1/3: Building React web app..." -ForegroundColor Yellow
pnpm install
pnpm build:skip-bindings

if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: Web build failed - dist directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Web app built successfully" -ForegroundColor Green

# Step 2: Navigate to Android directory
Write-Host ""
Write-Host "🤖 Step 2/3: Preparing Android build..." -ForegroundColor Yellow
Set-Location android

# Check if gradlew.bat exists
if (-not (Test-Path "gradlew.bat")) {
    Write-Host "❌ Error: Gradle wrapper not found" -ForegroundColor Red
    Write-Host "   Run: gradle wrapper --gradle-version 8.2" -ForegroundColor Yellow
    exit 1
}

# Step 3: Build the APK
Write-Host ""
Write-Host "🔨 Step 3/3: Building debug APK..." -ForegroundColor Yellow
.\gradlew.bat assembleDebug

# Check if APK was created
$apkPath = "app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apkPath)) {
    Write-Host "❌ Error: APK build failed - file not found at $apkPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Debug APK location:" -ForegroundColor Cyan
Write-Host "   $(Get-Location)\$apkPath" -ForegroundColor White
Write-Host ""
Write-Host "📋 To install on a connected device:" -ForegroundColor Cyan
Write-Host "   adb install $apkPath" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Done!" -ForegroundColor Green
