import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jzyg3qcwdokpd0fx.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
