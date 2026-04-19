/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow jfif images (not natively supported by Next.js optimizer)
    unoptimized: true,
  },
};

export default nextConfig;
