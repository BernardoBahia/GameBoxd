import type { NextConfig } from "next";
import path from "path";

function buildImagePatterns() {
  const patterns: { protocol: "http" | "https"; hostname: string; port: string; pathname: string }[] = [
    {
      protocol: "http",
      hostname: "localhost",
      port: "3001",
      pathname: "/uploads/**",
    },
  ];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      patterns.push({
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port || "",
        pathname: "/uploads/**",
      });
    } catch {
      // URL inválida, ignora
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  cacheHandler: path.resolve("./cache-handler.mjs"),
  cacheMaxMemorySize: 0,
  images: {
    remotePatterns: buildImagePatterns(),
  },
};

export default nextConfig;