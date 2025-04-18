module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!axios)/", 
  ],
  moduleFileExtensions: ["js", "jsx"],
  moduleNameMapper: {
    "\\.(css|less|scss)$": "identity-obj-proxy",
    "^axios$": require.resolve("axios/dist/node/axios.cjs"),
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
};
