import React from 'react'

import { getFilenames, getProject, Person } from '@/app/helpers/projects'
import { MDXRemote } from 'next-mdx-remote/rsc'
import path from 'path'
import YouTube from '@/app/components/mdx/Youtube'
import Avatar from '@/app/components/Avatar'

import { FaTrophy } from 'react-icons/fa6'

export async function generateStaticParams() {
  const filenames = getFilenames()
  // This regex will match either .md or .mdx, producing a valid URL from either.
  const markdownRegex = /\.md(x)?$/
  return filenames.map((filename) => ({
    slug: filename.replace(markdownRegex, '').split(path.sep),
  }))
}

export default function ProjectBySlug({
  params,
}: {
  params: { slug: string[]; locale: string }
}) {
  let content
  let project

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

  try {
    const project = getProject(params.slug)

    const getTagColor = (tag: string) => {
      const index = project.data.techStack.indexOf(tag)
      const colorIndex = index % tagColors.length
      return tagColors[colorIndex]
    }

    content = (
      <>
        <h1>{project.data.title}</h1>
        {project.data.winner && (
          <div>
            <h2>Awards</h2>
            <div
              className={`flex flex-row gap-2 w-1/5 items-center ${winnerColors[project.data.winner.color].bg} ${winnerColors[project.data.winner.color].text} p-3 lg:px-5 my-4 rounded-lg`}
            >
              <FaTrophy size={20} />
              <span className="text-lg">{project.data.winner.text}</span>
            </div>
          </div>
        )}
        <div>
          <h2>Stack</h2>
          <small className="text-gray-400">
            {project.data.techStack.map((tag: string, index: number) => {
              const colorClass = getTagColor(tag)
              return (
                <span
                  key={tag}
                  className={`inline-block rounded-full px-2 py-1 mr-1 mb-1 ${colorClass}`}
                >
                  {tag}
                </span>
              )
            })}
          </small>
        </div>
        <div>
          <h2>Team</h2>
          <div
            className={`grid max-w-xl grid-cols-${Math.min(project.data.hackers.length, 4)} gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-${Math.min(project.data.hackers.length, 4)}`}
          >
            {project.data.hackers.map((hacker: Person, index: number) => (
              <Avatar key={index} person={hacker} />
            ))}
          </div>
        </div>
        <div>
          <h2>Project details</h2>
          <MDXRemote source={project.content} components={{ YouTube }} />
        </div>
      </>
    )
  } catch (e) {
    console.log('error', e)
    content = (
      <>
        <h1>Project Not found</h1>
      </>
    )
  }
  return (
    <div id="project" className="flex min-h-screen bg-white py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className="mt-2 text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
          Project
        </h2>
        <article className="prose mg:prose-lg max-w-4xl mx-auto">
          {content}
        </article>
      </div>
    </div>
  )
}
