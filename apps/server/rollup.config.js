import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

// External dependencies that should not be bundled
// Bundle workspace packages and small utilities like uuid
const externalPackages = [
  // we need to manually list out dependencies of local packages
  "firebase-admin",

  "@opentelemetry/sdk-node",
  "@opentelemetry/api",
  "@opentelemetry/auto-instrumentations-node",

  "@google-cloud/opentelemetry-cloud-trace-exporter",
  "@google-cloud/logging-winston",
  "winston",

  ...Object.keys(pkg.dependencies || {}).filter(
    (dep) => !dep.startsWith("@templetto/") && dep !== "uuid"
  ),
  ...Object.keys(pkg.peerDependencies || {}),
];

// Use function to catch sub-paths (e.g., firebase-admin/firestore)
// This is the standard Rollup way to handle package sub-exports
const external = (id) => {
  return externalPackages.some((pkg) => id === pkg || id.startsWith(pkg + "/"));
};

export default defineConfig({
  input: ["src/rest-server.ts", "src/puppeteer-worker.ts"],
  output: {
    dir: "dist",
    format: "es", // ES modules since your package.json has "type": "module"
    sourcemap: true,
    banner: "#!/usr/bin/env node",
  },
  external,
  plugins: [
    // Handle JSON imports
    json(),

    // Resolve node modules
    nodeResolve({
      preferBuiltins: true, // Prefer Node.js built-ins over npm packages
      exportConditions: ["node"], // Use Node.js export conditions
      extensions: [".ts", ".js", ".json"], // Resolve these extensions for workspace packages
    }),

    // Convert CommonJS modules to ES6
    commonjs(),

    // TypeScript compilation
    typescript({
      tsconfig: "./tsconfig.json",
      compilerOptions: {
        // Override tsconfig for bundling
        noEmit: false,
        declaration: false,
        declarationMap: false,
        module: "ESNext",
        target: "ES2022",
        moduleResolution: "bundler",
      },
      include: ["src/**/*", "../../packages/*/src/**/*"], // Include workspace packages
      exclude: ["**/*.test.ts", "**/*.spec.ts"],
    }),
  ],

  // Suppress warnings for certain circular dependencies that are safe
  onwarn(warning, warn) {
    // Skip certain warnings
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    if (warning.code === "THIS_IS_UNDEFINED") return;

    // Use default for everything else
    warn(warning);
  },
});
