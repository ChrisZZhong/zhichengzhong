/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { outputFileTracingIncludes: { '/blog/*': ['./_posts/**/*.md'] } },
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
