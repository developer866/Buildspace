import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental:{
    optimizePackageImports:["@chakar-ui/react"]
  }
};

export default nextConfig;
