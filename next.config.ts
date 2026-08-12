import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "base-uri 'self'; frame-ancestors 'self'; object-src 'none'",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), browsing-topics=()",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    "/*": [
      "src/app/**/*.tsx",
      "content/guides/**/*.md",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/bike-listing-images/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/shop/:path*", destination: "/bikes", permanent: true },
      { source: "/cart", destination: "/bikes", permanent: true },
      { source: "/checkout", destination: "/bikes", permanent: true },
      { source: "/orders/:path*", destination: "/account/requests", permanent: true },
      {
        source: "/account/bookings",
        destination: "/account/rentals",
        permanent: true,
      },
      {
        source: "/account/orders",
        destination: "/account/rentals",
        permanent: true,
      },
      {
        source: "/booking-admin",
        destination: "/operations/requests",
        permanent: true,
      },
      {
        source: "/admin/orders/:path*",
        destination: "/operations/requests",
        permanent: false,
      },
      {
        source: "/admin/products/:path*",
        destination: "/operations/bikes",
        permanent: false,
      },
      {
        source: "/admin/inventory",
        destination: "/operations/bikes",
        permanent: false,
      },
      {
        source: "/admin/settings",
        destination: "/admin",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
