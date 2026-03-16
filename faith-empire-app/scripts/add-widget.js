const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const WIDGET_NAME = "DailyPrayerWidget";
const BUNDLE_ID = "com.decodedfaithempire";
const WIDGET_BUNDLE_ID = `${BUNDLE_ID}.${WIDGET_NAME}`;

const projectDir = process.cwd();
const iosDir = path.join(projectDir, "ios");

if (!fs.existsSync(iosDir)) {
  console.error("ERROR: ios/ directory not found");
  process.exit(1);
}

const xcodeProjs = fs.readdirSync(iosDir).filter((f) => f.endsWith(".xcodeproj"));
if (xcodeProjs.length === 0) {
  console.error("ERROR: No .xcodeproj found");
  process.exit(1);
}

const pbxprojPath = path.join(iosDir, xcodeProjs[0], "project.pbxproj");
console.log("Using project:", pbxprojPath);

const widgetDir = path.join(iosDir, WIDGET_NAME);
if (!fs.existsSync(widgetDir)) {
  fs.mkdirSync(widgetDir, { recursive: true });
}

fs.copyFileSync(
  path.join(projectDir, "widget-extension", "DailyPrayerWidget.swift"),
  path.join(widgetDir, "DailyPrayerWidget.swift")
);

fs.writeFileSync(
  path.join(widgetDir, "Info.plist"),
  `<?xml version="1.0" encoding="UTF-8"?>
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
</plist>`
);

fs.writeFileSync(
  path.join(widgetDir, `${WIDGET_NAME}.entitlements`),
  `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.${BUNDLE_ID}</string>
    </array>
</dict>
</plist>`
);

console.log("Widget files created.");

const xcodeprojModule = require("xcode");
const proj = xcodeprojModule.project(pbxprojPath);
proj.parseSync();

const existingTargets = proj.pbxNativeTargetSection();
let alreadyExists = false;
for (const key in existingTargets) {
  if (typeof existingTargets[key] === "object" && existingTargets[key].name === `"${WIDGET_NAME}"`) {
    alreadyExists = true;
    break;
  }
}

if (alreadyExists) {
  console.log("Widget target already exists, skipping injection.");
  process.exit(0);
}

const widgetTarget = proj.addTarget(
  WIDGET_NAME,
  "app_extension",
  WIDGET_NAME,
  WIDGET_BUNDLE_ID
);

const groupKey =
  proj.findPBXGroupKey({ name: WIDGET_NAME }) ||
  proj.pbxCreateGroup(WIDGET_NAME, WIDGET_NAME);

const mainGroupKey = proj.findPBXGroupKey({ name: undefined, path: undefined });
if (mainGroupKey) {
  const mainGroup = proj.getPBXGroupByKey(mainGroupKey);
  if (mainGroup && mainGroup.children) {
    const exists = mainGroup.children.some((c) => c.comment === WIDGET_NAME);
    if (!exists) {
      mainGroup.children.push({ value: groupKey, comment: WIDGET_NAME });
    }
  }
}

proj.addSourceFile(
  `${WIDGET_NAME}/DailyPrayerWidget.swift`,
  { target: widgetTarget.uuid },
  groupKey
);

proj.addFile(`${WIDGET_NAME}/Info.plist`, groupKey, {});
proj.addFile(`${WIDGET_NAME}/${WIDGET_NAME}.entitlements`, groupKey, {});

const configs = proj.pbxXCBuildConfigurationSection();
for (const key in configs) {
  const cfg = configs[key];
  if (
    typeof cfg === "object" &&
    cfg.buildSettings &&
    cfg.buildSettings.PRODUCT_BUNDLE_IDENTIFIER === `"${WIDGET_BUNDLE_ID}"`
  ) {
    cfg.buildSettings.SWIFT_VERSION = "5.0";
    cfg.buildSettings.TARGETED_DEVICE_FAMILY = '"1,2"';
    cfg.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = "17.0";
    cfg.buildSettings.CODE_SIGN_ENTITLEMENTS = `"${WIDGET_NAME}/${WIDGET_NAME}.entitlements"`;
    cfg.buildSettings.GENERATE_INFOPLIST_FILE = "NO";
    cfg.buildSettings.INFOPLIST_FILE = `"${WIDGET_NAME}/Info.plist"`;
    cfg.buildSettings.MARKETING_VERSION = "1.5.0";
    cfg.buildSettings.CURRENT_PROJECT_VERSION = "1";
    cfg.buildSettings.SWIFT_EMIT_LOC_STRINGS = "YES";
    cfg.buildSettings.ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = "AccentColor";
    cfg.buildSettings.ASSETCATALOG_COMPILER_WIDGET_BACKGROUND_COLOR_NAME = "WidgetBackground";
    cfg.buildSettings.LD_RUNPATH_SEARCH_PATHS =
      '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"';
    cfg.buildSettings.PRODUCT_NAME = '"$(TARGET_NAME)"';
    cfg.buildSettings.SKIP_INSTALL = "YES";
    cfg.buildSettings.CODE_SIGN_STYLE = "Automatic";
  }
}

fs.writeFileSync(pbxprojPath, proj.writeSync());
console.log("Widget target injected into Xcode project.");

const podfilePath = path.join(iosDir, "Podfile");
if (fs.existsSync(podfilePath)) {
  let podContent = fs.readFileSync(podfilePath, "utf8");
  if (!podContent.includes("CODE_SIGNING_ALLOWED")) {
    const patch = `
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        if target.respond_to?(:product_type) && target.product_type == 'com.apple.product-type.bundle'
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end`;

    if (podContent.includes("post_install")) {
      podContent = podContent.replace(
        /post_install\s+do\s*\|installer\|/,
        `post_install do |installer|${patch}`
      );
    } else {
      podContent += `\npost_install do |installer|${patch}\nend\n`;
    }
    fs.writeFileSync(podfilePath, podContent);
    console.log("Podfile patched for code signing.");
  }
}

console.log("=== Widget extension setup complete ===");
