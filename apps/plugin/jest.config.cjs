module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/?(*.)+(spec).ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.spec.ts",
    "!src/__tests__/**",
  ],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          types: ["jest", "@figma/plugin-typings"],
          esModuleInterop: true,
          skipLibCheck: true,
          lib: ["ES2017", "DOM"],
          target: "ES2017",
        },
      },
    ],
  },
  // Ignore Svelte files and mock files in tests
  modulePathIgnorePatterns: ["<rootDir>/.*\\.svelte$"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "\\.svelte$",
    "__tests__/figma-mock.ts",
  ],
};
