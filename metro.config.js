const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration for Artifex
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    alias: {
      // Add any path aliases here if needed
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
