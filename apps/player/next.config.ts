import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";
import path from "node:path";

const monorepoRoot = path.join(__dirname, "../..");
loadEnvConfig(monorepoRoot);

const revision =
  (process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.GITHUB_SHA ??
    spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim()) ||
  randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  disable: process.env.NODE_ENV === "development",
  globPublicPatterns: ["logo-*.png", "icon-*.png", "apple-touch-icon.png"],
});

/** Minimal Prisma client-engine tracing for Vercel (avoids 250 MB bundle bloat). */
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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default withSerwist(nextConfig);
