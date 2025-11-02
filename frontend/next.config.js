/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Proxy API to backend in dev/default to preserve cookies on same origin
    // If you set NEXT_PUBLIC_API_BASE_URL, client will bypass this.
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/:path*",
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Workaround for Windows FS cache rename issues in dev
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
