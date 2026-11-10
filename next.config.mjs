/** @type {import('next').NextConfig} */

import remarkGfm from 'remark-gfm'
import nextMdx from '@next/mdx'

const nextConfig = {
  // Netlify's deploy variables exist during builds, but not in SSR functions.
  // Inline the resolved origin so dynamic metadata also uses preview URLs.
  env: {
    SITE_ORIGIN:
      ['deploy-preview', 'branch-deploy'].includes(process.env.CONTEXT) &&
      process.env.DEPLOY_PRIME_URL
        ? process.env.DEPLOY_PRIME_URL
        : 'https://hackbarna.com',
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'md', 'ts', 'tsx'],
  // Optionally, add any other Next.js config below
  // output: "export", // Will export all routes as static html
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.lumacdn.com',
      },
    ],
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: false,
      },
    ]
  }
}

const withMDX = nextMdx({
  extension: /\.mdx?$|\.md$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
