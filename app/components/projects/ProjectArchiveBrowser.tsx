'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import {
  groupProjectCards,
  searchProjectCards,
  type ProjectCard,
  type ProjectEventSummary,
} from '@/lib/project-cards'
import { projectPrivacyNotice } from '@/data/project-privacy'
import ProjectGrid from './ProjectGrid'

function EventCover({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <span
      aria-hidden="true"
      className="hb-px block h-20 w-20 shrink-0 bg-band-2 p-px sm:h-32 sm:w-32 lg:h-36 lg:w-36"
    >
      <span className="hb-px flex h-full items-center justify-center overflow-hidden bg-ground-raised">
        {src && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            width={144}
            height={144}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-contain"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/brand/signet-white.svg"
            alt=""
            width={48}
            height={48}
            className="h-10 w-10 opacity-40 sm:h-12 sm:w-12"
          />
        )}
      </span>
    </span>
  )
}

export default function ProjectArchiveBrowser({
  projects,
  eventSummaries = [],
  locale,
}: {
  projects: ProjectCard[]
  eventSummaries?: ProjectEventSummary[]
  locale: string
}) {
  const [query, setQuery] = useState('')
  const [browseExpanded, setBrowseExpanded] = useState(new Set<string>())
  const [searchExpanded, setSearchExpanded] = useState(new Set<string>())
  const input = useRef<HTMLInputElement>(null)
  const searching = query.trim().length > 0
  const matches = useMemo(
    () => searchProjectCards(projects, query),
    [projects, query],
  )
  const visibleGroups = useMemo(
    () => groupProjectCards(matches, searching ? [] : eventSummaries),
    [matches, searching, eventSummaries],
  )
  const count = searching
    ? matches.length
    : visibleGroups.reduce((sum, group) => sum + group.total, 0)
  const expanded = searching ? searchExpanded : browseExpanded
  const setExpanded = searching ? setSearchExpanded : setBrowseExpanded
  const allExpanded = visibleGroups.every((group) => expanded.has(group.key))
  const dateFormat = new Intl.DateTimeFormat(
    ['en', 'es', 'ca', 'fr'].includes(locale) ? locale : 'en',
    { month: 'short', year: 'numeric', timeZone: 'UTC' },
  )

  function updateQuery(value: string) {
    setQuery(value)
    setSearchExpanded(
      new Set(
        groupProjectCards(searchProjectCards(projects, value)).map(
          (group) => group.key,
        ),
      ),
    )
  }

  function clearSearch() {
    updateQuery('')
    input.current?.focus()
  }

  return (
    <div>
      <form role="search" onSubmit={(event) => event.preventDefault()}>
        <label
          htmlFor="project-search"
          className="mb-3 block text-base font-semibold text-ink"
        >
          Search projects
        </label>
        <div className="focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-accent">
          <div className="hb-px flex items-center gap-3 bg-band-2 px-4 sm:px-5">
            <MagnifyingGlassIcon
              className="h-6 w-6 shrink-0 text-accent"
              aria-hidden="true"
            />
            <input
              ref={input}
              id="project-search"
              type="search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              aria-describedby="project-search-help"
              placeholder="What are you looking for?"
              autoComplete="off"
              className="min-w-0 flex-1 appearance-none bg-transparent py-5 text-base text-ink caret-accent outline-none placeholder:text-ink-dim sm:text-lg [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="flex h-11 w-11 shrink-0 items-center justify-center text-ink-dim hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-accent"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <p id="project-search-help" className="mt-3 text-sm text-ink-dim">
          Search by project, description, event, maker, topic or tool.
        </p>
      </form>

      <div className="mb-2 mt-10 flex min-h-11 flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <p role="status" aria-atomic="true" className="text-sm text-ink-dim">
          {count} {count === 1 ? 'project' : 'projects'}
          {searching ? ' across ' : ' built across '}
          {visibleGroups.length}{' '}
          {visibleGroups.length === 1 ? 'event' : 'events'}
          {searching ? ' found' : ''}
        </p>
        {visibleGroups.length > 0 && (
          <button
            type="button"
            onClick={() =>
              setExpanded(
                new Set(
                  allExpanded ? [] : visibleGroups.map((group) => group.key),
                ),
              )
            }
            className="min-h-11 text-sm font-semibold text-ink underline decoration-ink-dim/50 underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {allExpanded ? 'Collapse all events' : 'Expand all events'}
          </button>
        )}
      </div>

      <div className="divide-y divide-ink-dim/25 border-y border-ink-dim/25">
        {visibleGroups.map((group) => (
          <details
            key={group.key}
            data-project-event={group.key}
            open={expanded.has(group.key)}
            className="group/event"
          >
            <summary
              onClick={(event) => {
                // Keep native disclosure semantics without feeding programmatic
                // toggle events back into the saved browse/search states.
                event.preventDefault()
                setExpanded((current) => {
                  const next = new Set(current)
                  if (next.has(group.key)) next.delete(group.key)
                  else next.add(group.key)
                  return next
                })
              }}
              className="flex cursor-pointer list-none items-center gap-4 py-6 text-ink hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:gap-8 sm:py-8 [&::-webkit-details-marker]:hidden"
            >
              <EventCover key={group.image ?? group.key} src={group.image} />
              <div className="min-w-0 flex-1">
                {group.date > 0 && (
                  <time
                    dateTime={new Date(group.date).toISOString()}
                    className="mb-2 block text-xs tabular-nums text-ink-dim sm:text-sm"
                  >
                    {dateFormat.format(new Date(group.date))}
                  </time>
                )}
                <h2 className="break-words text-lg font-semibold leading-snug sm:text-2xl lg:text-3xl">
                  {group.name}
                </h2>
                <p className="mt-2 text-sm font-normal text-ink-dim">
                  {group.total} {group.total === 1 ? 'project' : 'projects'}
                  {searching ? '' : ' built'}
                </p>
              </div>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center text-accent sm:h-11 sm:w-11">
                <ChevronDownIcon
                  className="h-5 w-5 group-open/event:rotate-180"
                  aria-hidden="true"
                />
              </span>
            </summary>
            <div className="pb-10 sm:pb-12">
              {group.href && (
                <div className="mb-6 flex justify-end">
                  <Link
                    href={group.href}
                    className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    View event
                  </Link>
                </div>
              )}
              {!searching && group.total > group.projects.length && (
                <p className="mb-6 max-w-2xl text-sm leading-relaxed text-ink-dim">
                  {projectPrivacyNotice(locale)}
                </p>
              )}
              {group.projects.length > 0 && (
                <ProjectGrid projects={group.projects} />
              )}
            </div>
          </details>
        ))}
      </div>

      {visibleGroups.length === 0 && (
        <div className="py-16 sm:py-20">
          <h2 className="text-2xl font-semibold text-ink">
            {searching ? 'No projects found' : 'No projects published yet'}
          </h2>
          {searching && (
            <>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-ink-dim">
                Try a different project name, event or maker, or clear your
                search to see everything.
              </p>
              <button
                type="button"
                onClick={clearSearch}
                className="mt-5 min-h-11 font-semibold text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Clear search
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
