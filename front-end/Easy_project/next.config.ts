import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
  },
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
};

export default nextConfig;
