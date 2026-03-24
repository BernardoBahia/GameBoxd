import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  cacheHandler: path.resolve("./cache-handler.mjs"),
  // Disable in-memory cache so all server-side caching goes through Redis
  cacheMaxMemorySize: 0,
};

export default nextConfig;
