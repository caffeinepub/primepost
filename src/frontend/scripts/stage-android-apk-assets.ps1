# CI-friendly staging script for Android APK assets (PowerShell)
# This script ensures the APK and metadata are ready for deployment

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$AndroidDir = Join-Path $ProjectRoot "frontend\android"
$PublicAssetsDir = Join-Path $ProjectRoot "frontend\public\assets"
$ApkSource = Join-Path $AndroidDir "app\build\outputs\apk\debug\app-debug.apk"
$ApkDest = Join-Path $PublicAssetsDir "primepost.apk"
$MetaDest = Join-Path $PublicAssetsDir "primepost.apk.meta.json"

Write-Host "=== Android APK Staging Script ===" -ForegroundColor Cyan
Write-Host "Project root: $ProjectRoot"
Write-Host "Android dir: $AndroidDir"
Write-Host "Public assets dir: $PublicAssetsDir"
Write-Host ""

# Ensure public/assets directory exists
New-Item -ItemType Directory -Force -Path $PublicAssetsDir | Out-Null

# Check if APK already exists and is valid
if (Test-Path $ApkDest) {
    Write-Host "✓ APK already exists at $ApkDest" -ForegroundColor Green
    
    # Validate existing APK
    $ApkSize = (Get-Item $ApkDest).Length
    
    if ($ApkSize -lt 1048576) {
        Write-Host "✗ ERROR: Existing APK is too small ($ApkSize bytes, expected >= 1 MB)" -ForegroundColor Red
        exit 1
    }
    
    # Check PK header
    $Header = Get-Content $ApkDest -Encoding Byte -TotalCount 2
    if ($Header[0] -ne 0x50 -or $Header[1] -ne 0x4B) {
        Write-Host "✗ ERROR: Existing APK does not have valid PK header (got: 0x$($Header[0].ToString('X2')) 0x$($Header[1].ToString('X2')))" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ Existing APK is valid (size: $ApkSize bytes, PK header: OK)" -ForegroundColor Green
} else {
    Write-Host "⚠ APK not found at $ApkDest, checking source..." -ForegroundColor Yellow
    
    # Check if source APK exists
    if (-not (Test-Path $ApkSource)) {
        Write-Host "✗ ERROR: Source APK not found at $ApkSource" -ForegroundColor Red
        Write-Host "Please build the Android APK first using:"
        Write-Host "  cd frontend\android && .\gradlew.bat assembleDebug"
        exit 1
    }
    
    Write-Host "✓ Source APK found at $ApkSource" -ForegroundColor Green
    
    # Copy APK to public assets
    Write-Host "Copying APK to public assets..."
    Copy-Item $ApkSource $ApkDest -Force
    
    # Validate copied APK
    $ApkSize = (Get-Item $ApkDest).Length
    
    if ($ApkSize -lt 1048576) {
        Write-Host "✗ ERROR: Copied APK is too small ($ApkSize bytes, expected >= 1 MB)" -ForegroundColor Red
        exit 1
    }
    
    # Check PK header
    $Header = Get-Content $ApkDest -Encoding Byte -TotalCount 2
    if ($Header[0] -ne 0x50 -or $Header[1] -ne 0x4B) {
        Write-Host "✗ ERROR: Copied APK does not have valid PK header (got: 0x$($Header[0].ToString('X2')) 0x$($Header[1].ToString('X2')))" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ APK copied successfully (size: $ApkSize bytes, PK header: OK)" -ForegroundColor Green
}

# Generate or validate metadata
if (Test-Path $MetaDest) {
    Write-Host "✓ Metadata already exists at $MetaDest" -ForegroundColor Green
    
    # Validate metadata matches APK
    $MetaContent = Get-Content $MetaDest -Raw | ConvertFrom-Json
    $ActualSize = (Get-Item $ApkDest).Length
    
    if ($MetaContent.size -ne $ActualSize) {
        Write-Host "⚠ WARNING: Metadata size ($($MetaContent.size)) does not match APK size ($ActualSize)" -ForegroundColor Yellow
        Write-Host "Regenerating metadata..."
        
        # Generate SHA-256 checksum
        $Sha256 = (Get-FileHash $ApkDest -Algorithm SHA256).Hash.ToLower()
        
        # Create metadata JSON
        $Metadata = @{
            filename = "primepost.apk"
            size = $ActualSize
            sha256 = $Sha256
            buildDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        }
        
        $Metadata | ConvertTo-Json | Set-Content $MetaDest -Encoding UTF8
        
        Write-Host "✓ Metadata regenerated" -ForegroundColor Green
    } else {
        Write-Host "✓ Metadata is valid" -ForegroundColor Green
    }
} else {
    Write-Host "Generating metadata..."
    
    $ApkSize = (Get-Item $ApkDest).Length
    
    # Generate SHA-256 checksum
    $Sha256 = (Get-FileHash $ApkDest -Algorithm SHA256).Hash.ToLower()
    
    # Create metadata JSON
    $Metadata = @{
        filename = "primepost.apk"
        size = $ApkSize
        sha256 = $Sha256
        buildDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
    
    $Metadata | ConvertTo-Json | Set-Content $MetaDest -Encoding UTF8
    
    Write-Host "✓ Metadata generated" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Staging Complete ===" -ForegroundColor Cyan
Write-Host "APK: $ApkDest"
Write-Host "Metadata: $MetaDest"
Write-Host ""
Write-Host "Final validation:"
$ApkSize = (Get-Item $ApkDest).Length
$ApkSizeMB = [math]::Round($ApkSize / 1024 / 1024, 2)
Write-Host "  APK size: $ApkSize bytes ($ApkSizeMB MB)"
$Header = Get-Content $ApkDest -Encoding Byte -TotalCount 2
Write-Host "  APK header: 0x$($Header[0].ToString('X2'))$($Header[1].ToString('X2')) (expected: 0x504B)"
Write-Host "  Metadata: $(Get-Content $MetaDest -Raw)"
Write-Host ""

# Final validation
if ($ApkSize -lt 1048576) {
    Write-Host "✗ FATAL: APK is too small ($ApkSize bytes)" -ForegroundColor Red
    exit 1
}

if ($Header[0] -ne 0x50 -or $Header[1] -ne 0x4B) {
    Write-Host "✗ FATAL: APK does not have valid PK header" -ForegroundColor Red
    exit 1
}

Write-Host "✓ All validations passed. APK is ready for deployment." -ForegroundColor Green
exit 0
