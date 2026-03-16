/** @type {import('expo-apple-targets/app.plugin').Config} */
module.exports = {
  type: "widget",
  name: "DailyPrayerWidget",
  bundleIdentifier: ".DailyPrayerWidget",
  deploymentTarget: "17.0",
  frameworks: ["WidgetKit", "SwiftUI"],
  entitlements: {
    "com.apple.security.application-groups": ["group.com.decodedfaithempire"],
  },
};
