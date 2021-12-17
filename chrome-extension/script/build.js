const path = require("path");
const esbuild = require("esbuild");
const config = require("./config");

esbuild.buildSync({
  ...config,
  minify: true,
});
