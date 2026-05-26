import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FaTrophy } from 'react-icons/fa6'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgFooter from '@/app/components/home/OrgFooter'
import { getProjectsByEvent } from '@/app/helpers/projects'
import {
  getEventDataBySlug,
  getFeaturedUpcomingEvent,
} from '@/lib/events-server'

// Pre-render projects pages only for events that have at least one project today.
export async function generateStaticParams() {
  const slugs = ['v1-2024']
  return slugs.map((slug) => ({ slug }))
}

const TAG_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-green-100 text-green-700',
  'bg-yellow-100 text-yellow-700',
  'bg-orange-100 text-orange-700',
  'bg-red-100 text-red-700',
  'bg-blue-200 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
]

const WINNER_COLORS: { [key: string]: { bg: string; text: string } } = {
  yellow: { bg: 'bg-yellow-300', text: 'text-yellow-900' },
  blue: { bg: 'bg-blue-300', text: 'text-blue-900' },
  stone: { bg: 'bg-gray-300', text: 'text-gray-900' },
}

export default function EventProjectsPage({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  const eventData = getEventDataBySlug(params.slug)
  if (!eventData) {
    notFound()
  }
  const projects = getProjectsByEvent(params.slug)
  const featured = getFeaturedUpcomingEvent()

  // Collect tags for color cycling.
  const allTags = projects.flatMap((p) => p.data.techStack)
  const uniqueTags = Array.from(new Set(allTags))
  const getTagColor = (tag: string) =>
    TAG_COLORS[uniqueTags.indexOf(tag) % TAG_COLORS.length]

  // Past events use legacy URL canonical (per PAST_LEGACY_SLUGS); newer events use /events/<slug>.
  const PAST_LEGACY_SLUGS = new Set(['v1-2024', 'aisummit25'])
  const backHref = PAST_LEGACY_SLUGS.has(params.slug)
    ? `/${params.locale}/${params.slug}`
    : `/${params.locale}/events/${params.slug}`

  return (
    <div className="bg-white min-h-screen">
      <OrgNavbar featuredEvent={featured} />
      <main>
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
          <Link
            href={backHref}
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to {eventData.event.name}
          </Link>

          <p className="font-mono text-xs uppercase tracking-[0.32em] text-org-accent mb-3">
            / projects
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Projects from <span className="text-org-accent">{eventData.event.name}</span>
          </h1>
          {projects.length > 0 && (
            <p className="mt-3 text-base text-slate-600">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} shipped this edition.
            </p>
          )}

          {projects.length === 0 ? (
            <div className="mt-14 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">
              <p className="text-slate-500">No projects published from this edition yet.</p>
            </div>
          ) : (
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <Link
                  href={`/${params.locale}/projects/${project.slug}`}
                  key={project.slug}
                  data-testid="project-card"
                  className="group flex flex-col"
                >
                  <div className="overflow-hidden rounded-lg bg-slate-100 mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.data.thumbnailUrl}
                      alt={project.data.title}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-start gap-3 flex-wrap">
                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-org-accent transition-colors">
                      {project.data.title}
                    </h3>
                    {project.data.winner && WINNER_COLORS[project.data.winner.color] && (
                      <span
                        className={`inline-flex items-center gap-1.5 ${WINNER_COLORS[project.data.winner.color].bg} ${WINNER_COLORS[project.data.winner.color].text} px-2.5 py-0.5 rounded-full text-xs font-medium`}
                      >
                        <FaTrophy size={12} />
                        {project.data.winner.text}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-slate-600 text-sm">{project.data.description}</p>
                  {project.data.techStack.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.data.techStack.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-block rounded-full px-2 py-0.5 text-xs ${getTagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <OrgFooter />
    </div>
  )
}
