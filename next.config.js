const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["@libsql/client", "xlsx"],
};

module.exports = nextConfig;
