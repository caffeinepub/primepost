#!/bin/bash

# PrimePost Android APK Debug Build Script
# This script builds the React web app and then builds a debug APK

set -e  # Exit on error

echo "🚀 Building PrimePost Android APK (Debug)"
echo "=========================================="

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from frontend directory"
    exit 1
fi

# Step 1: Build the web app
echo ""
echo "📦 Step 1/4: Building React web app..."
pnpm install
pnpm build:skip-bindings

if [ ! -d "dist" ]; then
    echo "❌ Error: Web build failed - dist directory not found"
    exit 1
fi

echo "✅ Web app built successfully"

# Step 2: Navigate to Android directory
echo ""
echo "🤖 Step 2/4: Preparing Android build..."
cd android

# Check if gradlew exists
if [ ! -f "gradlew" ]; then
    echo "❌ Error: Gradle wrapper not found"
    echo "   Run: gradle wrapper --gradle-version 8.2"
    exit 1
fi

# Make gradlew executable
chmod +x gradlew

# Step 3: Build the APK
echo ""
echo "🔨 Step 3/4: Building debug APK..."
./gradlew assembleDebug

# Check if APK was created
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK_PATH" ]; then
    echo "❌ Error: APK build failed - file not found at $APK_PATH"
    exit 1
fi

# Verify APK size (minimum 1 MB = 1048576 bytes)
APK_SIZE=$(stat -f%z "$APK_PATH" 2>/dev/null || stat -c%s "$APK_PATH" 2>/dev/null)
MIN_SIZE=1048576

if [ "$APK_SIZE" -lt "$MIN_SIZE" ]; then
    echo "❌ Error: APK file is suspiciously small ($APK_SIZE bytes)"
    echo "   Expected at least 1 MB. Build may have failed."
    exit 1
fi

# Verify APK signature (ZIP/APK files start with "PK" = 0x504B)
echo ""
echo "🔍 Verifying APK signature..."
FIRST_BYTES=$(xxd -l 2 -p "$APK_PATH" 2>/dev/null || od -An -tx1 -N2 "$APK_PATH" 2>/dev/null | tr -d ' \n')

if [ "$FIRST_BYTES" != "504b" ] && [ "$FIRST_BYTES" != "50 4b" ]; then
    echo "❌ Error: APK has invalid signature (expected PK/ZIP header, got: $FIRST_BYTES)"
    echo "   The file may be corrupted or not a valid APK"
    exit 1
fi

echo "✅ APK signature verified (valid ZIP/APK file)"
echo "✅ APK built successfully ($APK_SIZE bytes)"

# Step 4: Copy APK to public assets and generate metadata
echo ""
echo "📋 Step 4/4: Publishing APK to public assets..."
cd ..

# Ensure public/assets directory exists
mkdir -p public/assets

# Copy APK with stable filename
cp "android/$APK_PATH" "public/assets/primepost.apk"

# Verify the copied file exists and has correct size
if [ ! -f "public/assets/primepost.apk" ]; then
    echo "❌ Error: Failed to copy APK to public/assets/primepost.apk"
    exit 1
fi

COPIED_SIZE=$(stat -f%z "public/assets/primepost.apk" 2>/dev/null || stat -c%s "public/assets/primepost.apk" 2>/dev/null)

if [ "$COPIED_SIZE" -ne "$APK_SIZE" ]; then
    echo "❌ Error: Copied APK size mismatch!"
    echo "   Source: $APK_SIZE bytes"
    echo "   Copied: $COPIED_SIZE bytes"
    exit 1
fi

if [ "$COPIED_SIZE" -lt "$MIN_SIZE" ]; then
    echo "❌ Error: Copied APK is too small ($COPIED_SIZE bytes)"
    exit 1
fi

# Verify copied APK signature
COPIED_FIRST_BYTES=$(xxd -l 2 -p "public/assets/primepost.apk" 2>/dev/null || od -An -tx1 -N2 "public/assets/primepost.apk" 2>/dev/null | tr -d ' \n')

if [ "$COPIED_FIRST_BYTES" != "504b" ] && [ "$COPIED_FIRST_BYTES" != "50 4b" ]; then
    echo "❌ Error: Copied APK has invalid signature"
    exit 1
fi

echo "✅ APK copied successfully (verified $COPIED_SIZE bytes)"

# Compute SHA-256 checksum
if command -v sha256sum &> /dev/null; then
    APK_SHA256=$(sha256sum "public/assets/primepost.apk" | awk '{print $1}')
elif command -v shasum &> /dev/null; then
    APK_SHA256=$(shasum -a 256 "public/assets/primepost.apk" | awk '{print $1}')
else
    APK_SHA256="unavailable"
    echo "⚠️  Warning: sha256sum/shasum not found, checksum not computed"
fi

# Generate metadata JSON
cat > "public/assets/primepost.apk.meta.json" <<EOF
{
  "filename": "primepost.apk",
  "size": $COPIED_SIZE,
  "sha256": "$APK_SHA256",
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "✅ Metadata generated successfully"

# Post-copy integrity check: verify the APK is byte-identical to source
echo ""
echo "🔍 Running post-copy integrity check..."

if command -v cmp &> /dev/null; then
    if cmp -s "android/$APK_PATH" "public/assets/primepost.apk"; then
        echo "✅ Integrity check passed: Files are byte-identical"
    else
        echo "❌ Error: Integrity check failed - files differ!"
        exit 1
    fi
else
    # Fallback: compare checksums
    if [ "$APK_SHA256" != "unavailable" ]; then
        SOURCE_SHA256=$(sha256sum "android/$APK_PATH" 2>/dev/null | awk '{print $1}' || shasum -a 256 "android/$APK_PATH" 2>/dev/null | awk '{print $1}')
        if [ "$SOURCE_SHA256" = "$APK_SHA256" ]; then
            echo "✅ Integrity check passed: Checksums match"
        else
            echo "❌ Error: Integrity check failed - checksums differ!"
            echo "   Source: $SOURCE_SHA256"
            echo "   Copied: $APK_SHA256"
            exit 1
        fi
    else
        echo "⚠️  Warning: Cannot verify integrity (no checksum tool available)"
    fi
fi

# Optional: Remote verification if DEPLOY_URL is set
if [ -n "$DEPLOY_URL" ]; then
    echo ""
    echo "🌐 Running remote verification against $DEPLOY_URL..."
    
    # Fetch remote metadata
    REMOTE_META_URL="${DEPLOY_URL}/assets/primepost.apk.meta.json"
    REMOTE_APK_URL="${DEPLOY_URL}/assets/primepost.apk"
    
    if command -v curl &> /dev/null; then
        REMOTE_META=$(curl -s "$REMOTE_META_URL" || echo "")
        
        if [ -n "$REMOTE_META" ]; then
            if command -v jq &> /dev/null; then
                REMOTE_SIZE=$(echo "$REMOTE_META" | jq -r '.size')
                REMOTE_SHA256=$(echo "$REMOTE_META" | jq -r '.sha256')
                
                echo "   Remote metadata: size=$REMOTE_SIZE, sha256=$REMOTE_SHA256"
                
                if [ "$REMOTE_SIZE" != "$COPIED_SIZE" ]; then
                    echo "❌ Error: Remote APK size ($REMOTE_SIZE) doesn't match local ($COPIED_SIZE)"
                    exit 1
                fi
                
                if [ "$REMOTE_SHA256" != "$APK_SHA256" ]; then
                    echo "❌ Error: Remote APK SHA-256 doesn't match local"
                    exit 1
                fi
                
                # Verify remote APK signature
                REMOTE_FIRST_BYTES=$(curl -s -r 0-1 "$REMOTE_APK_URL" | xxd -p | tr -d '\n')
                if [ "$REMOTE_FIRST_BYTES" != "504b" ]; then
                    echo "❌ Error: Remote APK has invalid signature (got: $REMOTE_FIRST_BYTES)"
                    echo "   The deployed file may be HTML/text instead of binary APK"
                    exit 1
                fi
                
                echo "✅ Remote verification passed"
            else
                echo "⚠️  Warning: jq not found, skipping remote verification"
            fi
        else
            echo "⚠️  Warning: Could not fetch remote metadata"
        fi
    else
        echo "⚠️  Warning: curl not found, skipping remote verification"
    fi
fi

echo ""
echo "✅ Build complete!"
echo ""
echo "📱 APK Information:"
echo "   Location: $(pwd)/public/assets/primepost.apk"
echo "   Size: $(numfmt --to=iec-i --suffix=B $COPIED_SIZE 2>/dev/null || echo "$COPIED_SIZE bytes")"
echo "   SHA-256: $APK_SHA256"
echo ""
echo "📋 To install on a connected device:"
echo "   adb install public/assets/primepost.apk"
echo ""
echo "🌐 The APK is now ready for deployment at /assets/primepost.apk"
echo "🎉 Done!"
