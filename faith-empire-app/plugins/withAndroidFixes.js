const { withAppBuildGradle, withGradleProperties, withAndroidManifest, withProjectBuildGradle } = require("@expo/config-plugins");

function withAndroidFixes(config) {
  // Update project-level build.gradle to use AGP 8.7+ which has 16KB support
  config = withProjectBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;
    
    // Ensure AGP version is 8.7.0+ for 16KB page support
    buildGradle = buildGradle.replace(
      /com\.android\.tools\.build:gradle:\d+\.\d+\.\d+/g,
      'com.android.tools.build:gradle:8.7.3'
    );
    
    config.modResults.contents = buildGradle;
    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;
    
    // Add billing library
    if (!buildGradle.includes('com.android.billingclient:billing')) {
      buildGradle = buildGradle.replace(
        /dependencies\s*\{/,
        "dependencies {\n    implementation 'com.android.billingclient:billing:7.1.1'"
      );
    }

    // Ensure packaging uses uncompressed native libs (required for 16KB)
    if (!buildGradle.includes('useLegacyPackaging')) {
      buildGradle = buildGradle.replace(
        /android\s*\{/,
        `android {\n    packaging {\n        jniLibs {\n            useLegacyPackaging = false\n        }\n    }`
      );
    }
    
    config.modResults.contents = buildGradle;
    return config;
  });

  // Set extractNativeLibs=false in manifest
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];
    if (mainApplication) {
      mainApplication.$["android:extractNativeLibs"] = "false";
    }
    return config;
  });

  // Gradle properties for 16KB page alignment
  config = withGradleProperties(config, (config) => {
    config.modResults.push(
      {
        type: "property",
        key: "android.experimental.enablePageAlignedElfSections",
        value: "true"
      },
      {
        type: "property",
        key: "expo.build.android.pageSize",
        value: "16384"
      }
    );
    return config;
  });

  return config;
}

module.exports = withAndroidFixes;
