import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 webpack(config) {
    config.externals.push('@browserbasehq/stagehand', '@browserbasehq/sdk', 'playwright');
    return config;
  },
};

export default nextConfig;
