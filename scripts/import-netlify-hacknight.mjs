#!/usr/bin/env node
// Read a private, read-only source snapshot; publish only the submitted gallery fields.
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import prettier from 'prettier'
import { imageType } from '../lib/live/media.ts'
import { slugify } from '../lib/live/validate.ts'

export const EVENT = 'hacknight-june-2026'
export const SOURCE = 'https://hackbarna-netlify-hacknight.netlify.app'
const SITE_ID = '978e2f15-7514-446f-9b3e-c14b41bfa450'
const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const clean = (value) => (typeof value === 'string' ? value.trim() : '')
const unavailableImages = new Map([
  [1, 'Submitted screenshot URL is an HTML app, not an image.'],
  [2, 'Submitted image-host link returns 404.'],
  [26, 'Submitted screenshot URL is an HTML app, not an image.'],
])

function publicUrl(value) {
  if (!clean(value)) return ''
  const url = new URL(clean(value))
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error('Only public HTTP links are allowed.')
  return url.href
}

export function prepareProjects(snapshot, { includeTests = false } = {}) {
  if (
    snapshot.sourceSite !== SITE_ID ||
    snapshot.sourceUrl !== SOURCE ||
    snapshot.event !== EVENT ||
    !Array.isArray(snapshot.projects)
  )
    throw new Error('Snapshot does not belong to the June Netlify HackNight.')

  const selected = new Map()
  const omitted = []
  const ids = new Set()
  for (const row of snapshot.projects) {
    if (!Number.isSafeInteger(row.id) || ids.has(row.id))
      throw new Error('Source IDs must be unique integers.')
    ids.add(row.id)
    if (
      !clean(row.name) ||
      !clean(row.team_name) ||
      !clean(row.tagline) ||
      !Number.isFinite(Date.parse(row.created_at))
    )
      throw new Error(`Incomplete submission ${row.id}.`)
    if (
      !includeTests &&
      row.id === 1 &&
      row.name === 'coolapp' &&
      row.tagline === 'cool stuff' &&
      row.description === 'cool desc'
    ) {
      omitted.push({ sourceId: row.id, reason: 'Apparent organiser test.' })
      continue
    }
    const key = JSON.stringify([
      clean(row.name).toLowerCase(),
      clean(row.team_name).toLowerCase(),
      publicUrl(row.demo_url).replace(/\/$/, ''),
      publicUrl(row.repo_url).replace(/\/$/, ''),
    ])
    const previous = selected.get(key)
    const newer =
      !previous ||
      Date.parse(row.created_at) > Date.parse(previous.created_at) ||
      (row.created_at === previous.created_at && row.id > previous.id)
    if (previous)
      omitted.push({
        sourceId: newer ? previous.id : row.id,
        reason: 'Duplicate submission; retained the latest matching project.',
      })
    if (newer) selected.set(key, row)
  }

  const slugs = new Set()
  const projects = [...selected.values()]
    .sort((a, b) => a.id - b.id)
    .map((row) => {
      const slug = slugify(row.name)
      if (slugs.has(slug)) throw new Error(`Project slug collision: ${slug}`)
      slugs.add(slug)
      // The source form explicitly asks for comma-separated team members.
      const names = clean(row.members)
        ? clean(row.members).split(',').map(clean).filter(Boolean)
        : [clean(row.team_name)]
      const data = {
        event: EVENT,
        title: clean(row.name),
        publishedDate: new Date(row.created_at).toISOString(),
        description: clean(row.tagline),
        thumbnailUrl: '',
        category: 'Technology',
        status: 'published',
        contentFormat: 'markdown',
        tags: clean(row.tags).split(',').map(clean).filter(Boolean),
        techStack: [],
        youtubeLink: '',
        hackers: names.map((name) => ({
          name,
          description:
            name === clean(row.team_name) ? '' : clean(row.team_name),
          image: { src: '' },
          links: {},
        })),
        links: {
          website: publicUrl(row.demo_url),
          ...(clean(row.repo_url) ? { github: publicUrl(row.repo_url) } : {}),
        },
      }
      const content =
        clean(row.description) ===
        'Description - what did you build, and how it work?'
          ? ''
          : clean(row.description)
      if (email.test(JSON.stringify({ data, content })))
        throw new Error(
          `Email found in public fields for submission ${row.id}.`,
        )
      const imageUrl = publicUrl(new URL(row.image_url, SOURCE).href)
      return { sourceId: row.id, slug, data, content, imageUrl }
    })
  return { projects, omitted: omitted.sort((a, b) => a.sourceId - b.sourceId) }
}

async function main(args) {
  const snapshotArg = args.indexOf('--snapshot')
  if (snapshotArg < 0 || !args[snapshotArg + 1])
    throw new Error(
      'Usage: node scripts/import-netlify-hacknight.mjs --snapshot /private/snapshot.json [--apply] [--include-test-projects]',
    )
  const snapshot = JSON.parse(await fs.readFile(args[snapshotArg + 1], 'utf8'))
  const { projects, omitted } = prepareProjects(snapshot, {
    includeTests: args.includes('--include-test-projects'),
  })
  const report = {
    source: SOURCE,
    event: EVENT,
    sourceRows: snapshot.projects.length,
    publishedProjects: projects.length,
    omitted,
    missingImages: projects
      .filter((project) => unavailableImages.has(project.sourceId))
      .map(({ sourceId }) => ({
        sourceId,
        reason: unavailableImages.get(sourceId),
      })),
  }
  if (!args.includes('--apply')) {
    console.log(JSON.stringify({ ...report, dryRun: true }, null, 2))
    return
  }

  const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
  const writes = []
  const records = []
  const extensions = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  // Validate and prepare the complete batch before touching public files.
  for (const project of projects) {
    let image
    if (!unavailableImages.has(project.sourceId)) {
      const response = await fetch(project.imageUrl, {
        signal: AbortSignal.timeout(30000),
      })
      if (!response.ok)
        throw new Error(`Screenshot fetch failed: ${project.slug}`)
      const bytes = Buffer.from(await response.arrayBuffer())
      const type = imageType(bytes)
      if (!type || bytes.length > 20 * 1024 * 1024)
        throw new Error(`Invalid or oversized screenshot: ${project.slug}`)
      const file = `/projects/${EVENT}/${project.slug}.${extensions[type]}`
      project.data.thumbnailUrl = file
      image = {
        sourceUrl: project.imageUrl,
        file,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      }
      writes.push({ file: path.join(root, 'public', file), bytes })
    }
    const filename = path.join(root, 'projects', EVENT, `${project.slug}.md`)
    writes.push({
      file: filename,
      bytes: await prettier.format(
        matter.stringify(project.content, project.data),
        {
          filepath: filename,
          singleQuote: true,
        },
      ),
    })
    records.push({ sourceId: project.sourceId, slug: project.slug, image })
  }
  const manifest = {
    ...report,
    capturedAt: snapshot.capturedAt,
    projects: records,
  }
  const filename = path.join(root, 'data/netlify-hacknight-import.json')
  writes.push({
    file: filename,
    bytes: await prettier.format(JSON.stringify(manifest), {
      filepath: filename,
    }),
  })
  for (const { file, bytes } of writes) {
    try {
      const existing = await fs.readFile(file)
      if (!existing.equals(Buffer.from(bytes)))
        throw new Error(
          `Existing file differs; review it before replacing: ${file}`,
        )
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  let created = 0
  for (const { file, bytes } of writes) {
    await fs.mkdir(path.dirname(file), { recursive: true })
    try {
      await fs.writeFile(file, bytes, { flag: 'wx' })
      created++
    } catch (error) {
      if (error.code !== 'EEXIST') throw error
    }
  }
  console.log(JSON.stringify({ ...report, createdFiles: created }, null, 2))
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
