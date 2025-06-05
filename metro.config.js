// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add TypeScript extensions to assetExts and sourceExts
config.resolver.sourceExts.push('tsx', 'ts');

module.exports = config;