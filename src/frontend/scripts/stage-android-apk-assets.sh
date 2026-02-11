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
    exit 1
  fi
  
  # Check PK header
  HEADER=$(xxd -l 2 -p "$APK_DEST" 2>/dev/null || od -An -tx1 -N2 "$APK_DEST" | tr -d ' \n' || echo "")
  if [ "$HEADER" != "504b" ] && [ "$HEADER" != "50 4b" ]; then
    echo "✗ ERROR: Existing APK does not have valid PK header (got: $HEADER)"
    exit 1
  fi
  
  echo "✓ Existing APK is valid (size: $APK_SIZE bytes, PK header: OK)"
else
  echo "⚠ APK not found at $APK_DEST, checking source..."
  
  # Check if source APK exists
  if [ ! -f "$APK_SOURCE" ]; then
    echo "✗ ERROR: Source APK not found at $APK_SOURCE"
    echo "Please build the Android APK first using:"
    echo "  cd frontend/android && ./gradlew assembleDebug"
    exit 1
  fi
  
  echo "✓ Source APK found at $APK_SOURCE"
  
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
  ACTUAL_SIZE=$(stat -f%z "$APK_DEST" 2>/dev/null || stat -c%s "$APK_DEST" 2>/dev/null || echo "0")
  
  if [ "$META_SIZE" != "$ACTUAL_SIZE" ]; then
    echo "⚠ WARNING: Metadata size ($META_SIZE) does not match APK size ($ACTUAL_SIZE)"
    echo "Regenerating metadata..."
    
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
  else
    echo "✓ Metadata is valid"
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
  exit 1
fi

if [ "$HEADER" != "504b" ] && [ "$HEADER" != "50 4b" ]; then
  echo "✗ FATAL: APK does not have valid PK header"
  exit 1
fi

echo "✓ All validations passed. APK is ready for deployment."
exit 0
