import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['*'],
  },
  output: 'standalone',
};

export default nextConfig;
