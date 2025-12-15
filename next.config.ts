import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CSP headers removed to prevent conflicts with Clerk and ElevenLabs SDKs
  // Next.js and modern browsers provide sufficient security without custom CSP
};

export default nextConfig;
