const { withAppBuildGradle, withGradleProperties, withAndroidManifest } = require("@expo/config-plugins");

function withAndroidFixes(config) {
  config = withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;
    
    if (!buildGradle.includes('com.android.billingclient:billing')) {
      buildGradle = buildGradle.replace(
        /dependencies\s*\{/,
        "dependencies {\n    implementation 'com.android.billingclient:billing:7.1.1'"
      );
    }

    if (!buildGradle.includes('maxElfAlignment')) {
      const packagingBlock = `
    packaging {
        jniLibs {
            useLegacyPackaging = false
        }
    }`;
      buildGradle = buildGradle.replace(
        /android\s*\{/,
        `android {${packagingBlock}`
      );
    }
    
    config.modResults.contents = buildGradle;
    return config;
  });

  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];
    if (mainApplication) {
      mainApplication.$["android:extractNativeLibs"] = "false";
    }
    return config;
  });

  config = withGradleProperties(config, (config) => {
    config.modResults.push(
      {
        type: "property",
        key: "android.experimental.enablePageAlignedElfSections",
        value: "true"
      }
    );
    return config;
  });

  return config;
}

module.exports = withAndroidFixes;
