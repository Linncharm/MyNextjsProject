import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    async redirects() {
        return [
            {
                source: '/',
                destination: '/proxy',
                permanent: true, // 永久重定向
            },
        ];
    },
    ignoreBuildErrors: true,
};

export default nextConfig;
