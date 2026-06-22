import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  outputFileTracingIncludes: {
    "/*": ["../../node_modules/.pnpm/**/node_modules/.prisma/client/**"],
  },
  serverExternalPackages: ["@neondatabase/serverless"],
  transpilePackages: ["@repo/ui", "@repo/domain", "@repo/database"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaPlugin } = require("@prisma/nextjs-monorepo-workaround-plugin");
      config.plugins.push(new PrismaPlugin());
    }
    return config;
  },
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
