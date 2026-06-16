/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Local dummy assets only for now. When the WordPress data source is wired in,
    // add the CMS host here (e.g. { protocol: 'https', hostname: 'creatorshome.in' }).
    remotePatterns: [],
  },
};

export default nextConfig;
