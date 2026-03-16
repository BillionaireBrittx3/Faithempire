const { withXcodeProject, withInfoPlist, withEntitlementsPlist, IOSConfig } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const WIDGET_NAME = "DailyPrayerWidget";
const WIDGET_BUNDLE_ID_SUFFIX = ".DailyPrayerWidget";

function withDailyPrayerWidget(config) {
  config = withWidgetEntitlements(config);
  config = withWidgetXcodeProject(config);
  return config;
}

function withWidgetEntitlements(config) {
  return withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.security.application-groups"] = [
      `group.${config.ios.bundleIdentifier}`,
    ];
    return config;
  });
}

function withWidgetXcodeProject(config) {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const bundleId = config.ios.bundleIdentifier;
    const widgetBundleId = bundleId + WIDGET_BUNDLE_ID_SUFFIX;
    const projectRoot = config.modRequest.projectRoot;
    const iosPath = path.join(projectRoot, "ios");
    const widgetDir = path.join(iosPath, WIDGET_NAME);

    if (!fs.existsSync(widgetDir)) {
      fs.mkdirSync(widgetDir, { recursive: true });
    }

    const widgetSwift = fs.readFileSync(
      path.join(projectRoot, "widget-extension", "DailyPrayerWidget.swift"),
      "utf8"
    );
    fs.writeFileSync(path.join(widgetDir, "DailyPrayerWidget.swift"), widgetSwift);

    const entitlements = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.${bundleId}</string>
    </array>
</dict>
</plist>`;
    fs.writeFileSync(path.join(widgetDir, `${WIDGET_NAME}.entitlements`), entitlements);

    const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
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
</plist>`;
    fs.writeFileSync(path.join(widgetDir, "Info.plist"), infoPlist);

    const targetUuid = xcodeProject.generateUuid();
    const widgetTarget = xcodeProject.addTarget(
      WIDGET_NAME,
      "app_extension",
      WIDGET_NAME,
      widgetBundleId
    );

    const groupKey = xcodeProject.findPBXGroupKey({ name: WIDGET_NAME }) ||
      xcodeProject.pbxCreateGroup(WIDGET_NAME, WIDGET_NAME);

    const mainGroupKey = xcodeProject.findPBXGroupKey({ name: undefined, path: undefined });
    if (mainGroupKey) {
      const mainGroup = xcodeProject.getPBXGroupByKey(mainGroupKey);
      if (mainGroup && mainGroup.children) {
        const alreadyAdded = mainGroup.children.some(
          (c) => c.comment === WIDGET_NAME
        );
        if (!alreadyAdded) {
          mainGroup.children.push({
            value: groupKey,
            comment: WIDGET_NAME,
          });
        }
      }
    }

    xcodeProject.addSourceFile(
      `${WIDGET_NAME}/DailyPrayerWidget.swift`,
      { target: widgetTarget.uuid },
      groupKey
    );

    xcodeProject.addFile(
      `${WIDGET_NAME}/Info.plist`,
      groupKey,
      {}
    );

    xcodeProject.addFile(
      `${WIDGET_NAME}/${WIDGET_NAME}.entitlements`,
      groupKey,
      {}
    );

    const buildConfigs = xcodeProject.pbxXCBuildConfigurationSection();
    for (const key in buildConfigs) {
      const config_entry = buildConfigs[key];
      if (
        typeof config_entry === "object" &&
        config_entry.buildSettings &&
        config_entry.buildSettings.PRODUCT_BUNDLE_IDENTIFIER === `"${widgetBundleId}"`
      ) {
        config_entry.buildSettings.SWIFT_VERSION = "5.0";
        config_entry.buildSettings.TARGETED_DEVICE_FAMILY = '"1,2"';
        config_entry.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = "17.0";
        config_entry.buildSettings.CODE_SIGN_ENTITLEMENTS = `"${WIDGET_NAME}/${WIDGET_NAME}.entitlements"`;
        config_entry.buildSettings.GENERATE_INFOPLIST_FILE = "NO";
        config_entry.buildSettings.INFOPLIST_FILE = `"${WIDGET_NAME}/Info.plist"`;
        config_entry.buildSettings.MARKETING_VERSION = "1.5.0";
        config_entry.buildSettings.CURRENT_PROJECT_VERSION = "1";
        config_entry.buildSettings.SWIFT_EMIT_LOC_STRINGS = "YES";
        config_entry.buildSettings.ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = "AccentColor";
        config_entry.buildSettings.ASSETCATALOG_COMPILER_WIDGET_BACKGROUND_COLOR_NAME = "WidgetBackground";
        config_entry.buildSettings.LD_RUNPATH_SEARCH_PATHS = '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"';
        config_entry.buildSettings.PRODUCT_NAME = `"$(TARGET_NAME)"`;
        config_entry.buildSettings.SKIP_INSTALL = "YES";
      }
    }

    return config;
  });
}

module.exports = withDailyPrayerWidget;
