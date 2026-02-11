# PrimePost Android APK Asset Staging Script (Windows)
# This script ensures the APK and metadata are ready for deployment

$ErrorActionPreference = "Stop"

Write-Host "🎬 Staging PrimePost Android APK for Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Check if we're in the frontend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Must run from frontend directory" -ForegroundColor Red
    exit 1
}

# Step 1: Check if APK already exists and is valid
Write-Host ""
Write-Host "🔍 Step 1/3: Checking for existing APK..." -ForegroundColor Yellow

$apkExists = $false
if (Test-Path "public\assets\primepost.apk") {
    $apkSize = (Get-Item "public\assets\primepost.apk").Length
    $minSize = 1048576  # 1 MB
    
    if ($apkSize -ge $minSize) {
        # Verify it's a real APK (starts with PK signature)
        $firstBytes = Get-Content "public\assets\primepost.apk" -Encoding Byte -TotalCount 2
        if ($firstBytes[0] -eq 0x50 -and $firstBytes[1] -eq 0x4B) {
            Write-Host "✅ Valid APK found ($apkSize bytes)" -ForegroundColor Green
            $apkExists = $true
        } else {
            Write-Host "⚠️  File exists but doesn't appear to be a valid APK (wrong signature)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  File exists but is too small ($apkSize bytes)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  No APK found at public\assets\primepost.apk" -ForegroundColor Yellow
}

# Step 2: Build APK if needed
if (-not $apkExists) {
    Write-Host ""
    Write-Host "🔨 Step 2/3: Building Android APK..." -ForegroundColor Yellow
    
    # Run the build script
    if (Test-Path "scripts\build-android-apk-debug.ps1") {
        & "scripts\build-android-apk-debug.ps1"
    } else {
        Write-Host "❌ Error: Build script not found at scripts\build-android-apk-debug.ps1" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "⏭️  Step 2/3: Skipping build (valid APK already exists)" -ForegroundColor Cyan
}

# Step 3: Verify final state
Write-Host ""
Write-Host "🔍 Step 3/3: Final verification..." -ForegroundColor Yellow

if (-not (Test-Path "public\assets\primepost.apk")) {
    Write-Host "❌ Error: APK not found after staging" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "public\assets\primepost.apk.meta.json")) {
    Write-Host "❌ Error: Metadata not found after staging" -ForegroundColor Red
    exit 1
}

$finalSize = (Get-Item "public\assets\primepost.apk").Length
$minSize = 1048576

if ($finalSize -lt $minSize) {
    Write-Host "❌ Error: Final APK is too small ($finalSize bytes)" -ForegroundColor Red
    exit 1
}

# Verify APK signature
$firstBytes = Get-Content "public\assets\primepost.apk" -Encoding Byte -TotalCount 2
if ($firstBytes[0] -ne 0x50 -or $firstBytes[1] -ne 0x4B) {
    Write-Host "❌ Error: Final APK has invalid signature (not a ZIP/APK file)" -ForegroundColor Red
    exit 1
}

# Read and verify metadata
$metadata = Get-Content "public\assets\primepost.apk.meta.json" | ConvertFrom-Json
$metaSize = $metadata.size
$metaSha256 = $metadata.sha256

if ($metaSize -ne $finalSize) {
    Write-Host "❌ Error: Metadata size ($metaSize) doesn't match APK size ($finalSize)" -ForegroundColor Red
    exit 1
}

if ([string]::IsNullOrEmpty($metaSha256)) {
    Write-Host "❌ Error: Metadata has empty SHA-256" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Metadata verified: size=$metaSize, sha256=$metaSha256" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Staging complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Ready for deployment:" -ForegroundColor Cyan
Write-Host "   APK: public\assets\primepost.apk ($finalSize bytes)" -ForegroundColor White
Write-Host "   Metadata: public\assets\primepost.apk.meta.json" -ForegroundColor White
Write-Host ""
Write-Host "🚀 You can now deploy the frontend with the APK included" -ForegroundColor Cyan
Write-Host "🎉 Done!" -ForegroundColor Green
