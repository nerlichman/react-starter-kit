/**
 * Expo config plugin to add use_modular_headers! to the iOS Podfile.
 *
 * Required because react-native-bottom-tabs depends on SDWebImage and
 * SDWebImageSVGCoder, which don't define modules. Without modular headers,
 * CocoaPods refuses to integrate them as static libraries.
 */
const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withModularHeaders(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let podfile = fs.readFileSync(podfilePath, "utf8");

      if (!podfile.includes("use_modular_headers!")) {
        podfile = podfile.replace(
          "use_expo_modules!",
          "use_modular_headers!\n  use_expo_modules!"
        );
        fs.writeFileSync(podfilePath, podfile);
      }

      return config;
    },
  ]);
};
