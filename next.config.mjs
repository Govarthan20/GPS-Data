/** @type {import('next').NextConfig} */
const nextConfig = {
    // Commented out output: 'export' to allow dynamic API routes and database connections.
    // If you are building for Capacitor, uncomment this or run a dedicated build script.
    // output: 'export', 
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
