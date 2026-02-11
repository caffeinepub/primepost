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
echo "📦 Step 1/3: Building React web app..."
pnpm install
pnpm build:skip-bindings

if [ ! -d "dist" ]; then
    echo "❌ Error: Web build failed - dist directory not found"
    exit 1
fi

echo "✅ Web app built successfully"

# Step 2: Navigate to Android directory
echo ""
echo "🤖 Step 2/3: Preparing Android build..."
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
echo "🔨 Step 3/3: Building debug APK..."
./gradlew assembleDebug

# Check if APK was created
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK_PATH" ]; then
    echo "❌ Error: APK build failed - file not found at $APK_PATH"
    exit 1
fi

echo ""
echo "✅ Build complete!"
echo ""
echo "📱 Debug APK location:"
echo "   $(pwd)/$APK_PATH"
echo ""
echo "📋 To install on a connected device:"
echo "   adb install $APK_PATH"
echo ""
echo "🎉 Done!"
