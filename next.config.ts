import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_API_USERNAME: process.env.NEXT_PUBLIC_API_USERNAME,
    NEXT_PUBLIC_API_PASSWORD: process.env.NEXT_PUBLIC_API_PASSWORD,
    NEXT_PUBLIC_OBSERVIUM_API_BASE_URL: process.env.NEXT_PUBLIC_OBSERVIUM_API_BASE_URL,
    NEXT_PUBLIC_PRTG_API_BASE_URL: process.env.NEXT_PUBLIC_PRTG_API_BASE_URL,
  },
};

export default nextConfig;
