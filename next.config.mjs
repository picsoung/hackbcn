/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: false,
      }
    ];
  },
};

export default nextConfig;