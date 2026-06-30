import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.ngrok-free.app", "*.ngrok.app", "*.ngrok.io", "*.loca.lt"],
    },
  },
};

export default nextConfig;
