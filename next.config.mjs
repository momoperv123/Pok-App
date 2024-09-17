/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/battle-simulator/:path*", // Match any route under /battle-simulator
        destination: "/battle-simulator/player-team-selection",
        permanent: false, // Temporary redirect
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

export default nextConfig;
