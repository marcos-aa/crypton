export default {
  preset: "ts-jest",
  testEnvironment: "node",
  bail: false,
  collectCoverage: false,
  collectCoverageFrom: [
    "src/middleware/*",
    "src/services/*",
    "src/utils/*/index.ts",
  ],
  globalSetup: "<rootDir>/seed.ts",
  globalTeardown: "<rootDir>/teardown.ts",
  testMatch: ["<rootDir>/__tests__/*", "<rootDir>/__tests__/unit/*"],
  coverageDirectory: "<rootDir>/coverage",
  coverageProvider: "v8",
  setupFilesAfterEnv: ["<rootDir>/mocks.ts"],
  clearMocks: true,
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
}
