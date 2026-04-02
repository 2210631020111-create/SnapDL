import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },

  // Remove the X-Powered-By: Next.js header for better security posture
  poweredByHeader: false,

  // Ensure images from Yahoo Finance (if any) are allowed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.yahoo.com",
      },
    ],
  },
};

export default nextConfig;
