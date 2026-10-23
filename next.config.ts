import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Multipart product photos use up to 5 MB plus form headers. The upload route
  // separately enforces its file limit before parsing and storing the image.
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
};

export default nextConfig;
