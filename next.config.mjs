/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Increase response limit for large responses
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  // CSP headers for Cloudflare Insights (injected by Railway observability)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-inline' cdn.usefathom.com cdn.prod.website-files.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' cdn.usefathom.com https://static.cloudflareinsights.com; frame-src 'self' https://js.stripe.com",
          },
        ],
      },
    ]
  },
}

export default nextConfig
