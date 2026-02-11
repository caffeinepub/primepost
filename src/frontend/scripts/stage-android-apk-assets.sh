#!/bin/bash
set -e

# CI-friendly staging script for Android APK assets
# This script ensures the APK and metadata are ready for deployment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/frontend/android"
PUBLIC_ASSETS_DIR="$PROJECT_ROOT/frontend/public/assets"
APK_SOURCE="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
APK_DEST="$PUBLIC_ASSETS_DIR/primepost.apk"
META_DEST="$PUBLIC_ASSETS_DIR/primepost.apk.meta.json"

echo "=== Android APK Staging Script ==="
echo "Project root: $PROJECT_ROOT"
echo "Android dir: $ANDROID_DIR"
echo "Public assets dir: $PUBLIC_ASSETS_DIR"
echo ""

# Ensure public/assets directory exists
mkdir -p "$PUBLIC_ASSETS_DIR"

# Check if APK already exists and is valid
if [ -f "$APK_DEST" ]; then
  echo "✓ APK already exists at $APK_DEST"
  
  # Validate existing APK
  APK_SIZE=$(stat -f%z "$APK_DEST" 2>/dev/null || stat -c%s "$APK_DEST" 2>/dev/null || echo "0")
  
  if [ "$APK_SIZE" -lt 1048576 ]; then
    echo "✗ ERROR: Existing APK is too small ($APK_SIZE bytes, expected >= 1 MB)"
    echo "This indicates the APK was not properly built or deployed."
    echo "The file may be an HTML error page instead of a real APK."
    exit 1
  fi
  
  # Check PK header
  HEADER=$(xxd -l 2 -p "$APK_DEST" 2>/dev/null || od -An -tx1 -N2 "$APK_DEST" | tr -d ' \n' || echo "")
  if [ "$HEADER" != "504b" ] && [ "$HEADER" != "50 4b" ]; then
    echo "✗ ERROR: Existing APK does not have valid PK header (got: $HEADER)"
    echo "Expected PK (0x50 0x4B) for valid ZIP/APK file."
    echo "The file is likely an HTML error page or corrupted."
    exit 1
  fi
  
  echo "✓ Existing APK is valid (size: $APK_SIZE bytes, PK header: OK)"
else
  echo "⚠ APK not found at $APK_DEST, checking source..."
  
  # Check if source APK exists
  if [ ! -f "$APK_SOURCE" ]; then
    echo "✗ ERROR: Source APK not found at $APK_SOURCE"
    echo ""
    echo "The Android APK must be built before deployment."
    echo "Please build the APK using one of these methods:"
    echo ""
    echo "  Method 1 - Full build script (recommended):"
    echo "    cd frontend"
    echo "    bash scripts/build-android-apk-debug.sh"
    echo ""
    echo "  Method 2 - Manual Gradle build:"
    echo "    cd frontend/android"
    echo "    ./gradlew assembleDebug"
    echo "    cd .."
    echo "    bash scripts/stage-android-apk-assets.sh"
    echo ""
    exit 1
  fi
  
  echo "✓ Source APK found at $APK_SOURCE"
  
  # Validate source APK before copying
  SOURCE_SIZE=$(stat -f%z "$APK_SOURCE" 2>/dev/null || stat -c%s "$APK_SOURCE" 2>/dev/null || echo "0")
  
  if [ "$SOURCE_SIZE" -lt 1048576 ]; then
    echo "✗ ERROR: Source APK is too small ($SOURCE_SIZE bytes, expected >= 1 MB)"
    echo "The Android build may have failed. Please rebuild the APK."
    exit 1
  fi
  
  SOURCE_HEADER=$(xxd -l 2 -p "$APK_SOURCE" 2>/dev/null || od -An -tx1 -N2 "$APK_SOURCE" | tr -d ' \n' || echo "")
  if [ "$SOURCE_HEADER" != "504b" ] && [ "$SOURCE_HEADER" != "50 4b" ]; then
    echo "✗ ERROR: Source APK does not have valid PK header (got: $SOURCE_HEADER)"
    echo "The Android build produced an invalid APK. Please rebuild."
    exit 1
  fi
  
  # Copy APK to public assets
  echo "Copying APK to public assets..."
  cp "$APK_SOURCE" "$APK_DEST"
  
  # Validate copied APK
  APK_SIZE=$(stat -f%z "$APK_DEST" 2>/dev/null || stat -c%s "$APK_DEST" 2>/dev/null || echo "0")
  
  if [ "$APK_SIZE" -lt 1048576 ]; then
    echo "✗ ERROR: Copied APK is too small ($APK_SIZE bytes, expected >= 1 MB)"
    exit 1
  fi
  
  # Check PK header
  HEADER=$(xxd -l 2 -p "$APK_DEST" 2>/dev/null || od -An -tx1 -N2 "$APK_DEST" | tr -d ' \n' || echo "")
  if [ "$HEADER" != "504b" ] && [ "$HEADER" != "50 4b" ]; then
    echo "✗ ERROR: Copied APK does not have valid PK header (got: $HEADER)"
    exit 1
  fi
  
  echo "✓ APK copied successfully (size: $APK_SIZE bytes, PK header: OK)"
fi

# Generate or validate metadata
if [ -f "$META_DEST" ]; then
  echo "✓ Metadata already exists at $META_DEST"
  
  # Validate metadata matches APK
  META_SIZE=$(grep -o '"size":[0-9]*' "$META_DEST" | cut -d: -f2 || echo "0")
  META_FILENAME=$(grep -o '"filename":"[^"]*"' "$META_DEST" | cut -d'"' -f4 || echo "")
  ACTUAL_SIZE=$(stat -f%z "$APK_DEST" 2>/dev/null || stat -c%s "$APK_DEST" 2>/dev/null || echo "0")
  
  # Check filename matches
  if [ "$META_FILENAME" != "primepost.apk" ]; then
    echo "⚠ WARNING: Metadata filename ($META_FILENAME) does not match expected (primepost.apk)"
    echo "Regenerating metadata..."
    REGENERATE=1
  elif [ "$META_SIZE" != "$ACTUAL_SIZE" ]; then
    echo "⚠ WARNING: Metadata size ($META_SIZE) does not match APK size ($ACTUAL_SIZE)"
    echo "Regenerating metadata..."
    REGENERATE=1
  else
    echo "✓ Metadata is valid"
    REGENERATE=0
  fi
  
  if [ "$REGENERATE" -eq 1 ]; then
    # Generate SHA-256 checksum
    if command -v sha256sum >/dev/null 2>&1; then
      SHA256=$(sha256sum "$APK_DEST" | cut -d' ' -f1)
    elif command -v shasum >/dev/null 2>&1; then
      SHA256=$(shasum -a 256 "$APK_DEST" | cut -d' ' -f1)
    else
      SHA256="unavailable"
    fi
    
    # Create metadata JSON
    cat > "$META_DEST" <<EOF
{
  "filename": "primepost.apk",
  "size": $ACTUAL_SIZE,
  "sha256": "$SHA256",
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
    
    echo "✓ Metadata regenerated"
  fi
else
  echo "Generating metadata..."
  
  APK_SIZE=$(stat -f%z "$APK_DEST" 2>/dev/null || stat -c%s "$APK_DEST" 2>/dev/null || echo "0")
  
  # Generate SHA-256 checksum
  if command -v sha256sum >/dev/null 2>&1; then
    SHA256=$(sha256sum "$APK_DEST" | cut -d' ' -f1)
  elif command -v shasum >/dev/null 2>&1; then
    SHA256=$(shasum -a 256 "$APK_DEST" | cut -d' ' -f1)
  else
    SHA256="unavailable"
  fi
  
  # Create metadata JSON
  cat > "$META_DEST" <<EOF
{
  "filename": "primepost.apk",
  "size": $APK_SIZE,
  "sha256": "$SHA256",
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
  
  echo "✓ Metadata generated"
fi

echo ""
echo "=== Staging Complete ==="
echo "APK: $APK_DEST"
echo "Metadata: $META_DEST"
echo ""
echo "Final validation:"
APK_SIZE=$(stat -f%z "$APK_DEST" 2>/dev/null || stat -c%s "$APK_DEST" 2>/dev/null || echo "0")
echo "  APK size: $APK_SIZE bytes ($(echo "scale=2; $APK_SIZE / 1024 / 1024" | bc 2>/dev/null || echo "N/A") MB)"
HEADER=$(xxd -l 2 -p "$APK_DEST" 2>/dev/null || od -An -tx1 -N2 "$APK_DEST" | tr -d ' \n' || echo "")
echo "  APK header: $HEADER (expected: 504b)"
echo "  Metadata: $(cat "$META_DEST")"
echo ""

# Final validation
if [ "$APK_SIZE" -lt 1048576 ]; then
  echo "✗ FATAL: APK is too small ($APK_SIZE bytes)"
  echo "Cannot deploy an APK smaller than 1 MB."
  exit 1
fi

if [ "$HEADER" != "504b" ] && [ "$HEADER" != "50 4b" ]; then
  echo "✗ FATAL: APK does not have valid PK header"
  echo "The file is not a valid Android APK package."
  exit 1
fi

echo "✓ All validations passed. APK is ready for deployment."
exit 0
