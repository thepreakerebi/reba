import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @reba/core ships TypeScript source with no build step — the protocol is the same file the
  // server triages with, so the questions on screen cannot drift from the ones being scored.
  transpilePackages: ["@reba/core"],
};

export default nextConfig;
