import type { NextConfig } from "next";
const nextConfig: NextConfig = { output: process.env.STANDALONE_BUILD === "true" ? "standalone" : undefined, poweredByHeader: false };
export default nextConfig;
