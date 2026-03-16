const {
  withXcodeProject,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

let withPodfile;
try {
  withPodfile = require("@expo/config-plugins").withPodfile;
} catch (e) {}

const WIDGET_NAME = "DailyPrayerWidget";
const BUNDLE_ID = "com.decodedfaithempire";
const WIDGET_BUNDLE_ID = `${BUNDLE_ID}.${WIDGET_NAME}`;

function withWidgetExtension(config) {
  if (withPodfile) {
    config = withPodfile(config, (config) => {
      const podfile = config.modResults.contents;

      const bundleSigningCode = `
    # [withWidget] Disable resource bundle signing (Xcode 14+)
    installer.target_installation_results.pod_target_installation_results
      .each do |pod_name, target_installation_result|
        target_installation_result.resource_bundle_targets.each do |resource_bundle_target|
          resource_bundle_target.build_configurations.each do |config|
            config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
          end
        end
      end`;

      if (!podfile.includes("[withWidget]")) {
        if (podfile.includes("post_install do |installer|")) {
          config.modResults.contents = podfile.replace(
            "post_install do |installer|",
            `post_install do |installer|${bundleSigningCode}`
          );
        } else {
          config.modResults.contents =
            podfile + `\npost_install do |installer|${bundleSigningCode}\nend\n`;
        }
        console.log("[withWidget] Podfile patched via withPodfile");
      }

      return config;
    });
  } else {
    config = withDangerousMod(config, [
      "ios",
      async (config) => {
        const iosPath = path.join(config.modRequest.projectRoot, "ios");
        const podfilePath = path.join(iosPath, "Podfile");

        if (fs.existsSync(podfilePath)) {
          let podContent = fs.readFileSync(podfilePath, "utf8");

          const bundleSigningCode = `
    # [withWidget] Disable resource bundle signing (Xcode 14+)
    installer.target_installation_results.pod_target_installation_results
      .each do |pod_name, target_installation_result|
        target_installation_result.resource_bundle_targets.each do |resource_bundle_target|
          resource_bundle_target.build_configurations.each do |config|
            config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
          end
        end
      end`;

          if (!podContent.includes("[withWidget]")) {
            if (podContent.includes("post_install do |installer|")) {
              podContent = podContent.replace(
                "post_install do |installer|",
                `post_install do |installer|${bundleSigningCode}`
              );
            } else {
              podContent += `\npost_install do |installer|${bundleSigningCode}\nend\n`;
            }
            fs.writeFileSync(podfilePath, podContent);
            console.log("[withWidget] Podfile patched via withDangerousMod");
          }
        }

        return config;
      },
    ]);
  }

  config = withXcodeProject(config, async (config) => {
    const proj = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const iosPath = path.join(projectRoot, "ios");

    const widgetDir = path.join(iosPath, WIDGET_NAME);
    if (!fs.existsSync(widgetDir)) {
      fs.mkdirSync(widgetDir, { recursive: true });
    }

    const srcSwift = path.join(
      projectRoot,
      "widget-extension",
      "DailyPrayerWidget.swift"
    );
    if (fs.existsSync(srcSwift)) {
      fs.copyFileSync(srcSwift, path.join(widgetDir, "DailyPrayerWidget.swift"));
    }

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

    const existingTargets = proj.pbxNativeTargetSection();
    let alreadyExists = false;
    for (const key in existingTargets) {
      if (
        typeof existingTargets[key] === "object" &&
        existingTargets[key].name === `"${WIDGET_NAME}"`
      ) {
        alreadyExists = true;
        break;
      }
    }

    if (!alreadyExists) {
      console.log("[withWidget] Adding widget target to Xcode project");

      const widgetTarget = proj.addTarget(
        WIDGET_NAME,
        "app_extension",
        WIDGET_NAME,
        WIDGET_BUNDLE_ID
      );

      const groupKey = proj.pbxCreateGroup(WIDGET_NAME, WIDGET_NAME);

      const mainGroupSection = proj.hash.project.objects["PBXGroup"];
      const projectObj = proj.getFirstProject();
      const mainGroupId = projectObj.firstProject.mainGroup;
      if (
        mainGroupSection[mainGroupId] &&
        mainGroupSection[mainGroupId].children
      ) {
        mainGroupSection[mainGroupId].children.push({
          value: groupKey,
          comment: WIDGET_NAME,
        });
      }

      const fileRefUuid = proj.generateUuid();
      const buildFileUuid = proj.generateUuid();
      
      proj.hash.project.objects["PBXFileReference"] = proj.hash.project.objects["PBXFileReference"] || {};
      proj.hash.project.objects["PBXFileReference"][fileRefUuid] = {
        isa: "PBXFileReference",
        lastKnownFileType: "sourcecode.swift",
        path: "DailyPrayerWidget.swift",
        sourceTree: '"<group>"',
      };
      proj.hash.project.objects["PBXFileReference"][`${fileRefUuid}_comment`] = "DailyPrayerWidget.swift";
      
      const groupSection = proj.hash.project.objects["PBXGroup"];
      if (groupSection[groupKey] && groupSection[groupKey].children) {
        groupSection[groupKey].children.push({
          value: fileRefUuid,
          comment: "DailyPrayerWidget.swift",
        });
      }
      
      proj.hash.project.objects["PBXBuildFile"] = proj.hash.project.objects["PBXBuildFile"] || {};
      proj.hash.project.objects["PBXBuildFile"][buildFileUuid] = {
        isa: "PBXBuildFile",
        fileRef: fileRefUuid,
        fileRef_comment: "DailyPrayerWidget.swift",
      };
      proj.hash.project.objects["PBXBuildFile"][`${buildFileUuid}_comment`] = "DailyPrayerWidget.swift in Sources";
      
      const nativeTargets = proj.hash.project.objects["PBXNativeTarget"];
      for (const key in nativeTargets) {
        const target = nativeTargets[key];
        if (typeof target === "object" && target.name === `"${WIDGET_NAME}"`) {
          const buildPhases = target.buildPhases;
          for (const bp of buildPhases) {
            const phase = proj.hash.project.objects["PBXSourcesBuildPhase"]?.[bp.value];
            if (phase) {
              phase.files = phase.files || [];
              phase.files.push({
                value: buildFileUuid,
                comment: "DailyPrayerWidget.swift in Sources",
              });
              break;
            }
          }
          break;
        }
      }

      const configs = proj.pbxXCBuildConfigurationSection();
      for (const key in configs) {
        const cfg = configs[key];
        if (
          typeof cfg === "object" &&
          cfg.buildSettings &&
          cfg.buildSettings.PRODUCT_BUNDLE_IDENTIFIER ===
            `"${WIDGET_BUNDLE_ID}"`
        ) {
          cfg.buildSettings.SWIFT_VERSION = "5.0";
          cfg.buildSettings.TARGETED_DEVICE_FAMILY = '"1,2"';
          cfg.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = "17.0";
          cfg.buildSettings.GENERATE_INFOPLIST_FILE = "NO";
          cfg.buildSettings.INFOPLIST_FILE = `"${WIDGET_NAME}/Info.plist"`;
          cfg.buildSettings.MARKETING_VERSION = "1.5.0";
          cfg.buildSettings.CURRENT_PROJECT_VERSION = "1";
          cfg.buildSettings.SWIFT_EMIT_LOC_STRINGS = "YES";
          cfg.buildSettings.LD_RUNPATH_SEARCH_PATHS =
            '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"';
          cfg.buildSettings.PRODUCT_NAME = '"$(TARGET_NAME)"';
          cfg.buildSettings.SKIP_INSTALL = "YES";
          cfg.buildSettings.CODE_SIGNING_ALLOWED = "NO";
          cfg.buildSettings.CODE_SIGN_IDENTITY = '""';
          cfg.buildSettings.DEVELOPMENT_TEAM = '""';
        }
      }

      console.log("[withWidget] Widget target added successfully");
    }

    return config;
  });

  return config;
}

module.exports = withWidgetExtension;
