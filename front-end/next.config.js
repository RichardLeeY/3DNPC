/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@ant-design/nextjs-registry"],

  webpack(config, { isServer, dev }) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    // shaders loader
    config.module.rules.push({
      test: /\.(wgsl|glsl|vs|fs)$/,
      loader: "ts-shader-loader",
    });
    return config;
  },
};

module.exports = nextConfig;
