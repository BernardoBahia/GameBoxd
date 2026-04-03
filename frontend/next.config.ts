import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  cacheHandler: path.resolve("./cache-handler.mjs"),
  // Disable in-memory cache so all server-side caching goes through Redis
  cacheMaxMemorySize: 0,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
