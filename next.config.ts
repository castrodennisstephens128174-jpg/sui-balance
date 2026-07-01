import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config, { webpack }) {
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^@x402\// }),
    );
    return config;
  },
};

export default nextConfig;
