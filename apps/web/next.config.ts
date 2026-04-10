import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@paylix/db"],
  webpack: (config, { webpack }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // @wagmi/connectors statically imports several optional peer deps
    // (porto, @coinbase/wallet-sdk, @metamask/connect-evm) for connectors
    // we don't use. None are installed. Ignore them at compile time so
    // webpack never tries to resolve or evaluate them.
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp:
          /^(porto(\/.*)?|@coinbase\/wallet-sdk|@metamask\/connect-evm)$/,
      }),
    );
    return config;
  },
};

export default nextConfig;
