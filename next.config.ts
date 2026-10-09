import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Minimal production bundle for cPanel Node.js hosting
  output: "standalone",
  outputFileTracingRoot: rootDir,
  turbopack: {
    // Pin to this app root so Turbopack does not treat ./app as the project root
    // (backend/ also has its own package-lock.json).
    root: rootDir,
  },
};

export default nextConfig;
