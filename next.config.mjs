/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['mermaid'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
