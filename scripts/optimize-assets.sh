#!/bin/bash
# Optimize game assets: Convert PNG characters to WebP
# Requires: cwebp (brew install webp)
# Usage: ./scripts/optimize-assets.sh

set -e

ASSETS_DIR="public/assets/scenarios/car-dealership"
QUALITY=85

# Check cwebp is installed
if ! command -v cwebp &> /dev/null; then
  echo "Error: cwebp not found. Install with: brew install webp"
  exit 1
fi

echo "=== Asset Optimization ==="
echo ""

# Get initial size
INITIAL_SIZE=$(du -sh "$ASSETS_DIR" | cut -f1)
echo "Initial size: $INITIAL_SIZE"

# Convert PNG characters to WebP
CHAR_DIR="$ASSETS_DIR/characters"
if [ -d "$CHAR_DIR" ]; then
  echo ""
  echo "Converting characters PNG → WebP (quality: $QUALITY)..."

  for png in "$CHAR_DIR"/*.png; do
    [ -f "$png" ] || continue
    webp="${png%.png}.webp"

    if [ -f "$webp" ]; then
      echo "  Skip (exists): $(basename "$webp")"
      continue
    fi

    cwebp -q "$QUALITY" "$png" -o "$webp" -quiet

    # Get sizes for comparison
    PNG_SIZE=$(stat -f%z "$png" 2>/dev/null || stat -c%s "$png")
    WEBP_SIZE=$(stat -f%z "$webp" 2>/dev/null || stat -c%s "$webp")
    SAVED=$((PNG_SIZE - WEBP_SIZE))
    PCT=$((SAVED * 100 / PNG_SIZE))

    echo "  $(basename "$png") → $(basename "$webp") (saved ${PCT}%)"

    # Remove original PNG after successful conversion
    rm "$png"
  done
fi

# Convert car PNGs if any
CAR_DIR="$ASSETS_DIR/cars"
if [ -d "$CAR_DIR" ]; then
  echo ""
  echo "Converting cars PNG → WebP..."

  for png in "$CAR_DIR"/*.png; do
    [ -f "$png" ] || continue
    webp="${png%.png}.webp"
    [ -f "$webp" ] && continue

    cwebp -q "$QUALITY" "$png" -o "$webp" -quiet
    rm "$png"
    echo "  $(basename "$png") → $(basename "$webp")"
  done
fi

# Final size
echo ""
FINAL_SIZE=$(du -sh "$ASSETS_DIR" | cut -f1)
echo "Final size: $FINAL_SIZE (was $INITIAL_SIZE)"
echo ""
echo "Done! Remember to update assetPath() in game/data/characters/index.ts:"
echo '  .png → .webp'
