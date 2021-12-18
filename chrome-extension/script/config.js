const path = require("path");

module.exports = {
  entryPoints: ["background.ts"],
  platform: "browser",
  bundle: true,
  external: ["path", "fs"],
  loader: {
    ".wasm": "binary",
    ".bin": "file",
  },
  tsconfig: path.resolve(__dirname, "../tsconfig.json"),
  absWorkingDir: path.resolve(__dirname, "../src"),
  outdir: path.resolve(__dirname, "../dist"),
};
