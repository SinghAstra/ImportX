import { validateWebEnv } from "@repo/env";

if (process.env.SKIP_ENV_VALIDATION !== "true") {
  validateWebEnv();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
