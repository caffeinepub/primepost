#!/bin/bash
set -e

# Pre-deployment wrapper script
# This script runs the staging script and fails fast if validation fails

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Pre-Deployment APK Staging ==="
echo "Running staging script..."
echo ""

# Detect platform and run appropriate staging script
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows (Git Bash, MSYS, etc.)
  powershell.exe -ExecutionPolicy Bypass -File "$SCRIPT_DIR/stage-android-apk-assets.ps1"
else
  # Unix-like (Linux, macOS)
  bash "$SCRIPT_DIR/stage-android-apk-assets.sh"
fi

STAGING_EXIT_CODE=$?

if [ $STAGING_EXIT_CODE -ne 0 ]; then
  echo ""
  echo "✗ DEPLOYMENT BLOCKED: APK staging failed with exit code $STAGING_EXIT_CODE"
  echo ""
  echo "The APK is either missing, invalid, or too small."
  echo "Please build the Android APK first:"
  echo "  cd frontend/android && ./gradlew assembleDebug"
  echo ""
  echo "Or run the staging script manually:"
  echo "  bash frontend/scripts/stage-android-apk-assets.sh"
  echo ""
  exit $STAGING_EXIT_CODE
fi

echo ""
echo "✓ Pre-deployment staging complete. APK is ready for deployment."
exit 0
