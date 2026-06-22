import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  serverExternalPackages: ["@prisma/client", "@neondatabase/serverless"],
  transpilePackages: ["@repo/ui", "@repo/domain", "@repo/database"],
};

export default nextConfig;
