/** @type {import('next').NextConfig} */

import remarkGfm from 'remark-gfm'
import nextMdx from '@next/mdx'

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'md', 'ts', 'tsx'],
  // Optionally, add any other Next.js config below
  // output: "export", // Will export all routes as static html
  reactStrictMode: true,
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
