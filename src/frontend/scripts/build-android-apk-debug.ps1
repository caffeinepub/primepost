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
Write-Host "📦 Step 1/4: Building React web app..." -ForegroundColor Yellow
pnpm install
pnpm build:skip-bindings

if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: Web build failed - dist directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Web app built successfully" -ForegroundColor Green

# Step 2: Navigate to Android directory
Write-Host ""
Write-Host "🤖 Step 2/4: Preparing Android build..." -ForegroundColor Yellow
Set-Location android

# Check if gradlew.bat exists
if (-not (Test-Path "gradlew.bat")) {
    Write-Host "❌ Error: Gradle wrapper not found" -ForegroundColor Red
    Write-Host "   Run: gradle wrapper --gradle-version 8.2" -ForegroundColor Yellow
    exit 1
}

# Step 3: Build the APK
Write-Host ""
Write-Host "🔨 Step 3/4: Building debug APK..." -ForegroundColor Yellow
.\gradlew.bat assembleDebug

# Check if APK was created
$apkPath = "app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apkPath)) {
    Write-Host "❌ Error: APK build failed - file not found at $apkPath" -ForegroundColor Red
    exit 1
}

# Verify APK size (minimum 1 MB = 1048576 bytes)
$apkSize = (Get-Item $apkPath).Length
$minSize = 1048576

if ($apkSize -lt $minSize) {
    Write-Host "❌ Error: APK file is suspiciously small ($apkSize bytes)" -ForegroundColor Red
    Write-Host "   Expected at least 1 MB. Build may have failed." -ForegroundColor Yellow
    exit 1
}

# Verify APK signature (ZIP/APK files start with "PK" = 0x504B)
Write-Host ""
Write-Host "🔍 Verifying APK signature..." -ForegroundColor Yellow
$firstBytes = Get-Content $apkPath -Encoding Byte -TotalCount 2

if ($firstBytes[0] -ne 0x50 -or $firstBytes[1] -ne 0x4B) {
    Write-Host "❌ Error: APK has invalid signature (expected PK/ZIP header)" -ForegroundColor Red
    Write-Host "   Got: 0x$($firstBytes[0].ToString('X2'))$($firstBytes[1].ToString('X2'))" -ForegroundColor Yellow
    Write-Host "   The file may be corrupted or not a valid APK" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ APK signature verified (valid ZIP/APK file)" -ForegroundColor Green
Write-Host "✅ APK built successfully ($apkSize bytes)" -ForegroundColor Green

# Step 4: Copy APK to public assets and generate metadata
Write-Host ""
Write-Host "📋 Step 4/4: Publishing APK to public assets..." -ForegroundColor Yellow
Set-Location ..

# Ensure public/assets directory exists
New-Item -ItemType Directory -Force -Path "public\assets" | Out-Null

# Copy APK with stable filename
Copy-Item "android\$apkPath" "public\assets\primepost.apk" -Force

# Verify the copied file exists and has correct size
if (-not (Test-Path "public\assets\primepost.apk")) {
    Write-Host "❌ Error: Failed to copy APK to public\assets\primepost.apk" -ForegroundColor Red
    exit 1
}

$copiedSize = (Get-Item "public\assets\primepost.apk").Length

if ($copiedSize -ne $apkSize) {
    Write-Host "❌ Error: Copied APK size mismatch!" -ForegroundColor Red
    Write-Host "   Source: $apkSize bytes" -ForegroundColor Yellow
    Write-Host "   Copied: $copiedSize bytes" -ForegroundColor Yellow
    exit 1
}

if ($copiedSize -lt $minSize) {
    Write-Host "❌ Error: Copied APK is too small ($copiedSize bytes)" -ForegroundColor Red
    exit 1
}

# Verify copied APK signature
$copiedFirstBytes = Get-Content "public\assets\primepost.apk" -Encoding Byte -TotalCount 2

if ($copiedFirstBytes[0] -ne 0x50 -or $copiedFirstBytes[1] -ne 0x4B) {
    Write-Host "❌ Error: Copied APK has invalid signature" -ForegroundColor Red
    exit 1
}

Write-Host "✅ APK copied successfully (verified $copiedSize bytes)" -ForegroundColor Green

# Compute SHA-256 checksum
$apkSha256 = (Get-FileHash "public\assets\primepost.apk" -Algorithm SHA256).Hash.ToLower()

# Generate metadata JSON
$buildDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$metadata = @{
    filename = "primepost.apk"
    size = $copiedSize
    sha256 = $apkSha256
    buildDate = $buildDate
} | ConvertTo-Json

$metadata | Out-File -FilePath "public\assets\primepost.apk.meta.json" -Encoding UTF8

Write-Host "✅ Metadata generated successfully" -ForegroundColor Green

# Post-copy integrity check: verify the APK is byte-identical to source
Write-Host ""
Write-Host "🔍 Running post-copy integrity check..." -ForegroundColor Yellow

$sourceHash = (Get-FileHash "android\$apkPath" -Algorithm SHA256).Hash.ToLower()
$copiedHash = $apkSha256

if ($sourceHash -eq $copiedHash) {
    Write-Host "✅ Integrity check passed: Files are byte-identical" -ForegroundColor Green
} else {
    Write-Host "❌ Error: Integrity check failed - checksums differ!" -ForegroundColor Red
    Write-Host "   Source: $sourceHash" -ForegroundColor Yellow
    Write-Host "   Copied: $copiedHash" -ForegroundColor Yellow
    exit 1
}

# Optional: Remote verification if DEPLOY_URL is set
$deployUrl = $env:DEPLOY_URL
if ($deployUrl) {
    Write-Host ""
    Write-Host "🌐 Running remote verification against $deployUrl..." -ForegroundColor Yellow
    
    # Fetch remote metadata
    $remoteMetaUrl = "$deployUrl/assets/primepost.apk.meta.json"
    $remoteApkUrl = "$deployUrl/assets/primepost.apk"
    
    try {
        $remoteMeta = Invoke-RestMethod -Uri $remoteMetaUrl -ErrorAction Stop
        
        $remoteSize = $remoteMeta.size
        $remoteSha256 = $remoteMeta.sha256
        
        Write-Host "   Remote metadata: size=$remoteSize, sha256=$remoteSha256" -ForegroundColor White
        
        if ($remoteSize -ne $copiedSize) {
            Write-Host "❌ Error: Remote APK size ($remoteSize) doesn't match local ($copiedSize)" -ForegroundColor Red
            exit 1
        }
        
        if ($remoteSha256 -ne $apkSha256) {
            Write-Host "❌ Error: Remote APK SHA-256 doesn't match local" -ForegroundColor Red
            exit 1
        }
        
        # Verify remote APK signature
        $remoteFirstBytes = Invoke-WebRequest -Uri $remoteApkUrl -Headers @{Range="bytes=0-1"} -ErrorAction Stop
        $remoteBytes = $remoteFirstBytes.Content
        
        if ($remoteBytes[0] -ne 0x50 -or $remoteBytes[1] -ne 0x4B) {
            Write-Host "❌ Error: Remote APK has invalid signature" -ForegroundColor Red
            Write-Host "   The deployed file may be HTML/text instead of binary APK" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host "✅ Remote verification passed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Warning: Could not verify remote deployment: $_" -ForegroundColor Yellow
    }
}

# Format size for display
$sizeMB = [math]::Round($copiedSize / 1MB, 2)

Write-Host ""
Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 APK Information:" -ForegroundColor Cyan
Write-Host "   Location: $(Get-Location)\public\assets\primepost.apk" -ForegroundColor White
Write-Host "   Size: $sizeMB MB ($copiedSize bytes)" -ForegroundColor White
Write-Host "   SHA-256: $apkSha256" -ForegroundColor White
Write-Host ""
Write-Host "📋 To install on a connected device:" -ForegroundColor Cyan
Write-Host "   adb install public\assets\primepost.apk" -ForegroundColor White
Write-Host ""
Write-Host "🌐 The APK is now ready for deployment at /assets/primepost.apk" -ForegroundColor Cyan
Write-Host "🎉 Done!" -ForegroundColor Green
