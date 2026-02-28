module.exports = {
  presets: ['module:@react-native/babel-preset'], // Note: Different preset name for newer React Native versions
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      blacklist: null,
      whitelist: null,
      safe: false,
      allowUndefined: true,
    }]
  ]
};