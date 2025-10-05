/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_PI_SANDBOX: 'true',
    NEXT_PUBLIC_PI_ENVIRONMENT: 'sandbox'
  },
  // Allow Pi Network domains
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://sandbox.minepi.com https://minepi.com;"
          }
        ]
      }
    ]
  },
  images: {
    domains: ['images.unsplash.com']
  }
}

module.exports = nextConfig