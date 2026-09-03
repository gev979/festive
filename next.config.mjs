/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Photos are supplied as arbitrary URLs via env, so image optimization is
  // opted out rather than maintaining a remotePatterns allowlist per deploy.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
