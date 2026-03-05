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
    domains: ['images.unsplash.com', 'i.pravatar.cc', 'api.dicebear.com'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**'
      }
    ]
  }
}

module.exports = nextConfig