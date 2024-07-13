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
  name: string
  job: string
  image: {
    src: string
  }
  links: {
    github?: string
    linkedin?: string
    twitter?: string
    [key: string]: string | undefined // Allows for additional link types
  }
}

export interface ProjectData {
  publishedDate: Date
  modifiedDate?: Date
  title: string
  description: string
  tags: string[]
  thumbnailUrl: string
  category: ProjectCategory
  status: 'draft' | 'published'
  youtubeLink: string
  hackers: Person[]
  techStack: string[] // Array of technologies used in the project
  winner?: {
    type: string
    text: string
    color:string
  }
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

export function getProject(slugOrFilePath: string[]): Project {
  const basePath = path.join(getProjectsDirectory(), ...slugOrFilePath)
  const filePaths = globSync([basePath + '.md', basePath + '.mdx', basePath])
  const markdownWithMeta = fs.readFileSync(filePaths[0], 'utf-8')
  const { data, content } = matter(markdownWithMeta)

  const projectData: ProjectData = {
    publishedDate: new Date(data.date),
    modifiedDate: data.modified ? new Date(data.modified) : undefined,
    title: data.title,
    description: data.description,
    tags: data.tags,
    thumbnailUrl: data.thumbnailUrl,
    category: data.category ?? 'Other',
    status: data.status ?? 'published',
    youtubeLink: data.youtubeLink,
    hackers: data.hackers,
    techStack: data.techStack,
    winner: data.winner ?? false,
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

export function getProjects(): Project[] {
  const filenames = getFilenames()
  return filenames
    .map((filename) => {
      return getProject([filename])
    })
    .filter((project) => {
      return project.data.status !== 'draft'
    })
    .sort(sortProjectsByName)
}
