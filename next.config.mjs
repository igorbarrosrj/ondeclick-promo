/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  experimental: {
    optimizeCss: true,
  },

  fonts: {
    disableNextFontDownloads: true,
  },

  // 🔥 Recomendado para VPSs lentas: reduz paralelismo de compilação
  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' };
    config.optimization.minimize = true;
    config.performance = { hints: false };
    return config;
  },
};

export default nextConfig;
