const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Watch the monorepo root so changes to packages/* hot-reload here.
config.watchFolders = [path.resolve(__dirname, "../..")];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(__dirname, "../../node_modules"),
];

// react-native-gifted-charts imports `react-native-linear-gradient` literally.
// Expo apps ship expo-linear-gradient instead — alias so the chart lib resolves.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react-native-linear-gradient") {
    return context.resolveRequest(context, "expo-linear-gradient", platform);
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, {
  input: "./src/global.css",
});
