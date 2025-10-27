const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "dist",
  basePath: "/pure-web-bottom-sheet/react-nextjs",
  trailingSlash: true,
  outputFileTracingRoot: __dirname,
};
module.exports = nextConfig;
