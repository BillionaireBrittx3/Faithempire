#!/bin/bash
set -e
echo "=== EAS Build: Post-install hook ==="
if [ "$EAS_BUILD_PLATFORM" = "android" ]; then
  echo "Installing expo-build-properties for Android build..."
  npx expo install expo-build-properties@~0.13.2 2>&1 || true
  echo "expo-build-properties installed"
fi
echo "=== Post-install hook complete ==="
