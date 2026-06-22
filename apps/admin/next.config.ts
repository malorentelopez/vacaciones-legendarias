import type { NextConfig } from "next";
import path from "node:path";

const prismaTracing = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  serverExternalPackages: ["@prisma/client", "pg"],
  outputFileTracingIncludes: {
    "/*": [
      "../../node_modules/.pnpm/**/node_modules/.prisma/client/query_compiler_bg.wasm",
      "../../node_modules/.pnpm/**/node_modules/.prisma/client/query_compiler_bg.js",
      "../../node_modules/.pnpm/**/node_modules/.prisma/client/wasm.js",
      "../../node_modules/.pnpm/**/node_modules/.prisma/client/schema.prisma",
    ],
  },
  outputFileTracingExcludes: {
    "/*": [
      "../../node_modules/.pnpm/**/node_modules/.prisma/client/libquery_engine-*",
      "../../node_modules/.pnpm/**/node_modules/.prisma/client/query_engine_bg*",
    ],
  },
} satisfies Pick<
  NextConfig,
  | "outputFileTracingRoot"
  | "serverExternalPackages"
  | "outputFileTracingIncludes"
  | "outputFileTracingExcludes"
>;

const nextConfig: NextConfig = {
  ...prismaTracing,
  transpilePackages: ["@repo/ui", "@repo/domain", "@repo/database"],
};

export default nextConfig;
