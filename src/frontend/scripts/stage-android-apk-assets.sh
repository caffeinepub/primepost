#!/bin/bash

# PrimePost Android APK Asset Staging Script
# This script ensures the APK and metadata are ready for deployment

set -e  # Exit on error

echo "🎬 Staging PrimePost Android APK for Deployment"
echo "================================================"

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from frontend directory"
    exit 1
fi

# Step 1: Check if APK already exists and is valid
echo ""
echo "🔍 Step 1/3: Checking for existing APK..."

APK_EXISTS=false
if [ -f "public/assets/primepost.apk" ]; then
    APK_SIZE=$(stat -f%z "public/assets/primepost.apk" 2>/dev/null || stat -c%s "public/assets/primepost.apk" 2>/dev/null)
    MIN_SIZE=1048576  # 1 MB
    
    if [ "$APK_SIZE" -ge "$MIN_SIZE" ]; then
        # Verify it's a real APK (starts with PK signature)
        FIRST_BYTES=$(xxd -l 2 -p "public/assets/primepost.apk" 2>/dev/null || od -An -tx1 -N2 "public/assets/primepost.apk" 2>/dev/null | tr -d ' \n')
        if [ "$FIRST_BYTES" = "504b" ] || [ "$FIRST_BYTES" = "50 4b" ]; then
            echo "✅ Valid APK found ($APK_SIZE bytes)"
            APK_EXISTS=true
        else
            echo "⚠️  File exists but doesn't appear to be a valid APK (wrong signature)"
        fi
    else
        echo "⚠️  File exists but is too small ($APK_SIZE bytes)"
    fi
else
    echo "⚠️  No APK found at public/assets/primepost.apk"
fi

# Step 2: Build APK if needed
if [ "$APK_EXISTS" = false ]; then
    echo ""
    echo "🔨 Step 2/3: Building Android APK..."
    
    # Run the build script
    if [ -f "scripts/build-android-apk-debug.sh" ]; then
        bash scripts/build-android-apk-debug.sh
    else
        echo "❌ Error: Build script not found at scripts/build-android-apk-debug.sh"
        exit 1
    fi
else
    echo ""
    echo "⏭️  Step 2/3: Skipping build (valid APK already exists)"
fi

# Step 3: Verify final state
echo ""
echo "🔍 Step 3/3: Final verification..."

if [ ! -f "public/assets/primepost.apk" ]; then
    echo "❌ Error: APK not found after staging"
    exit 1
fi

if [ ! -f "public/assets/primepost.apk.meta.json" ]; then
    echo "❌ Error: Metadata not found after staging"
    exit 1
fi

FINAL_SIZE=$(stat -f%z "public/assets/primepost.apk" 2>/dev/null || stat -c%s "public/assets/primepost.apk" 2>/dev/null)
MIN_SIZE=1048576

if [ "$FINAL_SIZE" -lt "$MIN_SIZE" ]; then
    echo "❌ Error: Final APK is too small ($FINAL_SIZE bytes)"
    exit 1
fi

# Verify APK signature
FIRST_BYTES=$(xxd -l 2 -p "public/assets/primepost.apk" 2>/dev/null || od -An -tx1 -N2 "public/assets/primepost.apk" 2>/dev/null | tr -d ' \n')
if [ "$FIRST_BYTES" != "504b" ] && [ "$FIRST_BYTES" != "50 4b" ]; then
    echo "❌ Error: Final APK has invalid signature (not a ZIP/APK file)"
    exit 1
fi

# Read and verify metadata
if command -v jq &> /dev/null; then
    META_SIZE=$(jq -r '.size' "public/assets/primepost.apk.meta.json")
    META_SHA256=$(jq -r '.sha256' "public/assets/primepost.apk.meta.json")
    
    if [ "$META_SIZE" != "$FINAL_SIZE" ]; then
        echo "❌ Error: Metadata size ($META_SIZE) doesn't match APK size ($FINAL_SIZE)"
        exit 1
    fi
    
    if [ -z "$META_SHA256" ] || [ "$META_SHA256" = "null" ]; then
        echo "❌ Error: Metadata has empty SHA-256"
        exit 1
    fi
    
    echo "✅ Metadata verified: size=$META_SIZE, sha256=$META_SHA256"
else
    echo "⚠️  Warning: jq not found, skipping metadata validation"
fi

echo ""
echo "✅ Staging complete!"
echo ""
echo "📱 Ready for deployment:"
echo "   APK: public/assets/primepost.apk ($FINAL_SIZE bytes)"
echo "   Metadata: public/assets/primepost.apk.meta.json"
echo ""
echo "🚀 You can now deploy the frontend with the APK included"
echo "🎉 Done!"
