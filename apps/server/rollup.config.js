import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

// External dependencies that should not be bundled
const external = [
  // Node.js built-ins
  "fs",
  "path",
  "url",
  "util",
  "os",
  "crypto",
  "stream",
  "events",
  "buffer",
  "child_process",
  "cluster",
  "dgram",
  "dns",
  "http",
  "https",
  "net",
  "tls",
  "querystring",
  "readline",
  "repl",
  "string_decoder",
  "sys",
  "tty",
  "v8",
  "vm",
  "zlib",
  "assert",
  "constants",
  "domain",
  "punycode",
  "timers",

  // Dependencies that should remain external (typically native modules or large deps)
  "@sparticuz/chromium",
  "puppeteer-core",
  "uuid",
  "winston",
  "@google-cloud/logging-winston",

  // Any other dependencies you want to keep external
  // BUT exclude workspace packages so they get bundled
  ...Object.keys(pkg.dependencies || {}).filter(dep => !dep.startsWith('@templetto/')),
  ...Object.keys(pkg.peerDependencies || {}),
];

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
      extensions: ['.ts', '.js', '.json'], // Resolve these extensions for workspace packages
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
