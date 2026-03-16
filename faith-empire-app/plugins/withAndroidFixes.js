const { withAppBuildGradle, withGradleProperties } = require("expo/config-plugins");

function withAndroidFixes(config) {
  config = withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;
    
    if (!buildGradle.includes('com.android.billingclient:billing')) {
      buildGradle = buildGradle.replace(
        /dependencies\s*\{/,
        "dependencies {\n    implementation 'com.android.billingclient:billing:7.1.1'"
      );
    }
    
    config.modResults.contents = buildGradle;
    return config;
  });

  config = withGradleProperties(config, (config) => {
    config.modResults.push({
      type: "property",
      key: "android.experimental.enablePageAlignedElfSections",
      value: "true"
    });
    return config;
  });

  return config;
}

module.exports = withAndroidFixes;
