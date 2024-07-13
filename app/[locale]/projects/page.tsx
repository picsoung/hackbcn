import React from 'react'
import { getProjects } from '@/app/helpers/projects'
import Link from 'next/link'

import { FaTrophy } from 'react-icons/fa6'

export default function Page(props: { params: { locale: string } }) {
  const projects = getProjects()
  const allTags: string[] = []
  projects.forEach((project) => {
    allTags.push(...project.data.techStack)
  })
  const uniqueTags = Array.from(new Set(allTags))

  const tagColors = [
    'bg-indigo-100 text-indigo-700',
    'bg-green-100 text-green-700',
    'bg-yellow-100 text-yellow-700',
    'bg-orange-100 text-orange-700',
    'bg-red-100 text-red-700',
    'bg-blue-200 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
  ]

  const getTagColor = (tag: string) => {
    const index = uniqueTags.indexOf(tag)
    const colorIndex = index % tagColors.length
    return tagColors[colorIndex]
  }

  const winnerColors: { [key: string]: { bg: string; text: string } } = {
    yellow: {
      bg: 'bg-yellow-300',
      text: 'text-yellow-900',
    },
    blue: {
      bg: 'bg-blue-300',
      text: 'text-blue-900',
    },
    stone: {
      bg: 'bg-gray-300',
      text: 'text-gray-900',
    },
  }

  return (
    <div id="conduct" className="flex min-h-screen bg-white py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className="mt-2 text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
          Projects
        </h2>
        <div className="mx-auto max-w-7xl px-4 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {' '}
          {projects.map((project) => (
            <Link
              href={`/${props.params.locale}/projects/${project.slug}`}
              data-testid={'project-card'}
              key={project.slug}
            >
              <div className="m-4 p- flex flex-col items-start">
                {' '}
                <div className="mb-2">
                  <img
                    src={project.data.thumbnailUrl}
                    alt={project.data.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row items-center gap-4">
                    <h3 className="flex text-xl font-semibold">
                      {project.data.title}
                    </h3>
                    {project.data.winner && (
                      <div
                        className={`flex flex-row gap-2 items-center ${winnerColors[project.data.winner.color].bg} ${winnerColors[project.data.winner.color].text} p-3 lg:px-5 my-4 rounded-lg`}
                      >
                        <FaTrophy size={20} />
                        <span className="text-lg">
                          {project.data.winner.text}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-500">{project.data.description}</p>
                  {/* <p>
                    <small className="text-gray-400">
                      {project.data.publishedDate.toLocaleDateString()}
                    </small>
                  </p> */}
                  <p>
                    <small className="text-gray-400">
                      {project.data.techStack.map(
                        (tag: string, index: number) => {
                          const colorClass = getTagColor(tag)
                          return (
                            <span
                              key={tag}
                              className={`inline-block rounded-full px-2 py-1 mr-1 mb-1 ${colorClass}`}
                            >
                              {tag}
                            </span>
                          )
                        },
                      )}
                    </small>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
