import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
