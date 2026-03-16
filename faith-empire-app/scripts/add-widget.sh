#!/bin/bash
set -e

echo "=== Adding Daily Prayer Widget Extension ==="

PROJECT_DIR="$PWD"
IOS_DIR="$PROJECT_DIR/ios"
BUNDLE_ID="com.decodedfaithempire"
WIDGET_BUNDLE_ID="${BUNDLE_ID}.DailyPrayerWidget"

if [ ! -d "$IOS_DIR" ]; then
  echo "ERROR: ios/ directory not found. Run expo prebuild first."
  exit 1
fi

XCODEPROJ=$(find "$IOS_DIR" -name "*.xcodeproj" -maxdepth 1 | head -1)
if [ -z "$XCODEPROJ" ]; then
  echo "ERROR: No .xcodeproj found in $IOS_DIR"
  ls -la "$IOS_DIR"
  exit 1
fi

PBXPROJ="$XCODEPROJ/project.pbxproj"
echo "Using project: $XCODEPROJ"

WIDGET_DIR="$IOS_DIR/DailyPrayerWidget"
mkdir -p "$WIDGET_DIR"

cp "$PROJECT_DIR/widget-extension/DailyPrayerWidget.swift" "$WIDGET_DIR/DailyPrayerWidget.swift"

cat > "$WIDGET_DIR/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>Daily Prayer</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
    <key>CFBundleShortVersionString</key>
    <string>1.5.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>NSExtension</key>
    <dict>
        <key>NSExtensionPointIdentifier</key>
        <string>com.apple.widgetkit-extension</string>
    </dict>
</dict>
</plist>
PLIST

cat > "$WIDGET_DIR/DailyPrayerWidget.entitlements" << ENTITLEMENTS
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.${BUNDLE_ID}</string>
    </array>
</dict>
</plist>
ENTITLEMENTS

echo "Widget files created in $WIDGET_DIR"
echo "Injecting widget target into Xcode project..."

ruby "$PROJECT_DIR/scripts/inject-widget-target.rb" "$PBXPROJ" "$WIDGET_BUNDLE_ID"

echo "Fixing Podfile code signing..."
PODFILE="$IOS_DIR/Podfile"
if [ -f "$PODFILE" ]; then
  ruby "$PROJECT_DIR/scripts/fix-codesigning.rb" "$PODFILE"
fi

echo "=== Widget Extension Added Successfully ==="
