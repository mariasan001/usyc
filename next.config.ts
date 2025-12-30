 import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // ✅ permite usar <Image /> en export estático
  },
};

export default nextConfig;
