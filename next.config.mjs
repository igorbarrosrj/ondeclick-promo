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

  // 🔥 Impede Next.js de baixar fontes do Google durante o build (resolve travamentos e lentidão)
  experimental: {
    optimizeCss: true,
  },

  fonts: {
    disableNextFontDownloads: true,
  },

  // ⚙️ Otimiza performance em VPSs com CPU limitada
  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' };
    config.optimization.minimize = true;
    config.performance = { hints: false };
    return config;
  },
};

export default nextConfig;
