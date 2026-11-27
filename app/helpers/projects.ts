import path from 'path'
import fs from 'fs'
import { globSync } from 'glob'
import matter from 'gray-matter'

export type ProjectCategory =
  | 'Technology'
  | 'Healthcare'
  | 'Education'
  | 'Other'

export interface Person {
  creditIndex?: number
  profileSlug?: string
  name: string
  description: string
  job?: string
  image: {
    src: string
  }
  links: Links
}

export interface Links {
  github?: string
  linkedin?: string
  twitter?: string
  website?: string
  [key: string]: string | undefined // Allows for additional link types
}

export interface ProjectData {
  publishedDate: Date
  modifiedDate?: Date
  title: string
  description: string
  tags: string[]
  topics?: string[]
  tools?: string[]
  challenges?: string[]
  thumbnailUrl: string
  projectImage?: string
  category: ProjectCategory
  // Private projects contribute to event totals without exposing their details.
  status: 'draft' | 'published' | 'private'
  contentFormat?: 'markdown' | 'mdx'
  youtubeLink: string
  hackers: Person[]
  techStack: string[] // Array of technologies used in the project
  links?: Links
  winner?: {
    type: string
    text: string
    color: string
  }
  event?: string // event slug — used for per-event project filtering
}

export interface Project {
  data: ProjectData
  slug: string
  content: string
}

function getProjectsDirectory(): string {
  const root = process.cwd()
  return path.join(root, `/projects`)
}

export function getFilenames(): string[] {
  const projectsDirectory = getProjectsDirectory()
  return globSync(
    [projectsDirectory + '/**/*.md', projectsDirectory + '/**/*.mdx'],
    {
      absolute: false,
      cwd: projectsDirectory,
    },
  )
}

function readProject(slugOrFilePath: string[]): Project {
  const basePath = path.join(getProjectsDirectory(), ...slugOrFilePath)
  const filePaths = globSync([basePath + '.md', basePath + '.mdx', basePath])
  const markdownWithMeta = fs.readFileSync(filePaths[0], 'utf-8')
  const { data, content } = matter(markdownWithMeta)

  const projectData: ProjectData = {
    publishedDate: new Date(data.publishedDate ?? data.date),
    modifiedDate:
      data.modifiedDate || data.modified
        ? new Date(data.modifiedDate ?? data.modified)
        : undefined,
    title: data.title,
    description: data.description,
    tags: data.tags,
    topics: data.topics,
    tools: data.tools,
    challenges: data.challenges,
    thumbnailUrl: data.thumbnailUrl,
    category: data.category ?? 'Other',
    status: data.status ?? 'published',
    contentFormat: data.contentFormat,
    youtubeLink: data.youtubeLink,
    hackers: data.hackers,
    techStack: data.techStack,
    winner: data.winner ?? false,
    links: Array.isArray(data.links)
      ? Object.assign({}, ...data.links)
      : (data.links ?? {}),
    event: data.event ?? undefined,
  }

  return {
    data: projectData,
    content: content,
    slug: path.join(...slugOrFilePath).split('.')[0],
  }
}

function sortProjectsByName(project1: Project, project2: Project) {
  return project1.data.title
    .toLowerCase()
    .localeCompare(project2.data.title.toLowerCase())
}

/** Public detail lookup: drafts and private projects behave like missing pages. */
export function getProject(slugOrFilePath: string[]): Project {
  const project = readProject(slugOrFilePath)
  if (project.data.status !== 'published') throw new Error('Project not found')
  return project
}

/** Server source snapshots for visibility resolution and verified owner views. */
export function getBuiltProjects(): Project[] {
  return getFilenames()
    .map((filename) => readProject([filename]))
    .filter(
      (project) =>
        project.data.status === 'published' ||
        project.data.status === 'private',
    )
    .sort(sortProjectsByName)
}

export function getBuiltProject(slug: string[]): Project | null {
  try {
    const project = readProject(slug)
    return project.data.status === 'published' ||
      project.data.status === 'private'
      ? project
      : null
  } catch {
    return null
  }
}

export function getProjects(): Project[] {
  const filenames = getFilenames()
  return filenames
    .map((filename) => {
      return readProject([filename])
    })
    .filter((project) => {
      return project.data.status === 'published'
    })
    .sort(sortProjectsByName)
}

/** Anonymous event totals only. Never return private project names or builders. */
export function getArchivedProjectCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const filename of getFilenames()) {
    const { data } = readProject([filename])
    if (data.status !== 'published' && data.status !== 'private') continue
    const key = data.event ?? 'community'
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

// Returns projects whose frontmatter `event:` matches the given slug.
// Winners surface first, then alphabetical.
export function getProjectsByEvent(eventSlug: string): Project[] {
  return getProjects()
    .filter((project) => project.data.event === eventSlug)
    .sort((a, b) => {
      const aWinner = a.data.winner ? 0 : 1
      const bWinner = b.data.winner ? 0 : 1
      if (aWinner !== bWinner) return aWinner - bWinner
      return a.data.title
        .toLowerCase()
        .localeCompare(b.data.title.toLowerCase())
    })
}
