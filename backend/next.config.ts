import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },

  // ExcelJS uses Node.js native APIs (streams, zlib) that cannot be bundled
  // for the Edge runtime. Mark it as external so Vercel uses the Node.js runtime.
  serverExternalPackages: ["exceljs"],

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
