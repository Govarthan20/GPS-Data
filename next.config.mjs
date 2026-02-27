/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // Required for Capacitor to use a static build
    images: {
        unoptimized: true, // Required for static export
    },
};

export default nextConfig;
