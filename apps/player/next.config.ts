import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Include hoisted deps (Prisma engine) from monorepo root in serverless bundles
  outputFileTracingRoot: path.join(__dirname, "../.."),
  serverExternalPackages: ["@prisma/client"],
  transpilePackages: ["@repo/ui", "@repo/domain", "@repo/database"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
