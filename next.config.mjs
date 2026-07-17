/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Product images served from /api/products/:id/image and /api/image-uploads/:id
    unoptimized: true,
  },
};

export default nextConfig;
