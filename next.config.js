/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'ar.rdcpix.com',
        },
        {
          protocol: 'https',
          hostname: 'ar.rdcpix.com',
        },
        {
          protocol: 'http',
          hostname: 'ap.rdcpix.com',
        },
        {
          protocol: 'https',
          hostname: 'ap.rdcpix.com',
        }
      ],
    },
  }
  
  module.exports = nextConfig