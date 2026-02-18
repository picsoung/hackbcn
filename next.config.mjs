/** @type {import('next').NextConfig} */

import remarkGfm from 'remark-gfm'
import nextMdx from '@next/mdx'

const legacyProjectSlugs = [
  'AQ-App', 'candit', 'DermaTech', 'DocLingo', 'Ducktors',
  'Eloquent_AI', 'flightmate', 'Kidventure', 'Level_Access',
  'Meal_Matcher', 'MeetingMind', 'Mulets_Team', 'PitchAI',
  'Pocketpal', 'SecAgents', 'Simplifai', 'TrafficFlow_AI', 'YourTravelSong',
]

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
      ...legacyProjectSlugs.map((slug) => ({
        source: `/:locale/projects/${slug}`,
        destination: `/:locale/projects/v1-2024/${slug}`,
        permanent: true,
      })),
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
