const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Block tmp directories created by native packages during postinstall
// (race condition where Metro sees dir during install then it's deleted)
const existingBlockList = config.resolver.blockList;
config.resolver.blockList = existingBlockList
  ? new RegExp(`(${existingBlockList.source})|.*_tmp_\\d+.*`)
  : /.*_tmp_\d+.*/;

module.exports = config;
