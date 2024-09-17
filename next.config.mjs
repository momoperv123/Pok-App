/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/battle-simulator/:path*",
        destination: "/battle-simulator/player-team-selection",
        permanent: false,
        has: [
          {
            type: "query",
            key: "redirected",
            value: "true",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
