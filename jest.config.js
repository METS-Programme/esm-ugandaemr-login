/**
 * @returns {Promise<import('jest').Config>}
 */

module.exports = {
  transform: {
    "^.+\\.(j|t)sx?$": "@swc/jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!@openmrs)"],
  moduleNameMapper: {
    "\\.(s?css)$": "identity-obj-proxy",
    "@openmrs/esm-framework": "@openmrs/esm-framework/mock",
    "^dexie$": require.resolve("dexie"),
    "^lodash-es/(.*)$": "lodash/$1",
    "^uuid$": "<rootDir>/node_modules/uuid/dist/index.js",
    "react-i18next": "<rootDir>/__mocks__/react-i18next.js",
  },
  collectCoverageFrom: [
    "**/src/**/*.component.tsx",
    "!**/node_modules/**",
    "!**/vendor/**",
    "!**/src/**/*.test.*",
    "!**/src/declarations.d.ts",
    "!**/e2e/**",
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/src/setup-tests.ts"],
  testPathIgnorePatterns: ["<rootDir>/e2e"],
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost/",
  },
};
