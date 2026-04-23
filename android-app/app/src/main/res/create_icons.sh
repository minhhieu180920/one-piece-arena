#!/bin/bash
# Create simple PNG icons using base64
# 1x1 orange pixel PNG
ORANGE_PNG="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="

for dir in mipmap-mdpi mipmap-hdpi mipmap-xhdpi mipmap-xxhdpi mipmap-xxxhdpi; do
    echo "$ORANGE_PNG" | base64 -d > $dir/ic_launcher.png 2>/dev/null || echo "$ORANGE_PNG" | base64 --decode > $dir/ic_launcher.png
    cp $dir/ic_launcher.png $dir/ic_launcher_round.png
done
echo "Icons created"
