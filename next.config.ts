import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This config is crucial for @xenova/transformers to work in the browser
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp: false,            // Ignored because we don't have Node.js in the browser
      "onnxruntime-node": false, // Ignored because we use WebAssembly, not Node
    };
    return config;
  },
};

export default nextConfig;