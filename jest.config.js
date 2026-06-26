module.exports = {
  preset: '@react-native/jest-preset',
  // Several deps ship ESM that must be Babel-transformed (the RN preset only
  // whitelists react-native itself). Add the libraries Bolt 0 introduced.
  transformIgnorePatterns: [
    'node_modules/(?!(?:(?:jest-)?react-native' +
      '|@react-native' +
      '|@react-native-community' +
      '|@react-navigation' +
      '|react-native-url-polyfill' +
      '|react-native-screens' +
      '|react-native-keychain' +
      '|react-native-safe-area-context' +
      '|@supabase' +
      '|zustand' +
      ')/)',
  ],
};
