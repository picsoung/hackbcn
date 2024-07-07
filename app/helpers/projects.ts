import path from 'path'
import fs from 'fs'
import { globSync } from 'glob'
import matter from 'gray-matter'

export type ProjectCategory =
  | 'Technology'
  | 'Healthcare'
  | 'Education'
  | 'Other'

export interface Hacker {
  name: string
  job: string
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
  hackers: Hacker[]
  //   techStack: string[]; // Array of technologies used in the project
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
    //   techStack: data.techStack,
  }

  return {
    data: projectData,
    content: content,
    slug: path.join(...slugOrFilePath).split('.')[0],
  }
}

function sortArticlesByDate(project1: Project, project2: Project) {
  const date1 = project1.data.publishedDate.getTime()
  const date2 = project2.data.publishedDate.getTime()
  return date2 - date1
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
    .sort(sortArticlesByDate)
}
