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
  echo "✗✗✗ DEPLOYMENT BLOCKED ✗✗✗"
  echo ""
  echo "APK staging failed with exit code $STAGING_EXIT_CODE"
  echo ""
  echo "The APK is either:"
  echo "  • Missing (not built yet)"
  echo "  • Too small (< 1 MB, likely an HTML error page)"
  echo "  • Invalid (missing PK header signature)"
  echo ""
  echo "To fix this, build the Android APK first:"
  echo ""
  echo "  cd frontend"
  echo "  bash scripts/build-android-apk-debug.sh"
  echo ""
  echo "This will:"
  echo "  1. Build the React web app"
  echo "  2. Build the Android APK"
  echo "  3. Copy the APK to public/assets/primepost.apk"
  echo "  4. Generate metadata at public/assets/primepost.apk.meta.json"
  echo ""
  echo "After building, re-run deployment."
  echo ""
  exit $STAGING_EXIT_CODE
fi

echo ""
echo "✓ Pre-deployment staging complete. APK is ready for deployment."
exit 0
