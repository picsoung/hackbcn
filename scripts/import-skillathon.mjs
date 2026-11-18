#!/usr/bin/env node
// Import the public gallery from a private snapshot; never publish account fields.
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import prettier from 'prettier'
import { imageType } from '../lib/live/media.ts'
import { slugify, videoEmbed } from '../lib/live/validate.ts'

export const EVENT = 'skillathon-hacknight-2026'
export const SOURCE = 'https://hackbarna-skillathon.netlify.app'
const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const clean = (value) => (typeof value === 'string' ? value.trim() : '')
const normalized = (value) => clean(value).replace(/\s+/g, ' ').toLowerCase()
const idPattern = /^[a-z0-9]{16,64}$/
const imageHosts = new Set([
  'www.grunge.com',
  'i.ibb.co',
  'raw.githubusercontent.com',
])

function publicUrl(value, hosts) {
  const url = new URL(value)
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    (hosts && !hosts.has(url.hostname))
  )
    throw new Error('Expected a public HTTPS source link.')
  return url.href
}

export function summary(description) {
  const text = clean(description).replace(/\s+/g, ' ')
  if (text.length <= 220) return text
  const sentence = text.match(/^(.{35,220}?[.!?])(?:\s|$)/)?.[1]
  return sentence || text.slice(0, 219).replace(/\s+\S*$/, '') + '…'
}

export function prepareProjects(snapshot) {
  if (
    snapshot.sourceUrl !== SOURCE ||
    snapshot.endpoint !== '/api/projects' ||
    snapshot.event !== EVENT ||
    !Array.isArray(snapshot.data) ||
    !Number.isFinite(Date.parse(snapshot.capturedAt))
  )
    throw new Error(
      'Snapshot does not belong to the March Skill-a-thon gallery.',
    )
  const selected = new Map()
  const ids = new Set()
  const omitted = []
  for (const row of snapshot.data) {
    if (
      !idPattern.test(clean(row._id)) ||
      row._id !== clean(row._id) ||
      ids.has(row._id)
    )
      throw new Error('Source project IDs must be unique and safe.')
    ids.add(row._id)
    if (
      !clean(row.authorId) ||
      !clean(row.authorName) ||
      !clean(row.title) ||
      !clean(row.description) ||
      !Array.isArray(row.teamMembers) ||
      row.teamMembers.some((name) => !clean(name)) ||
      !Array.isArray(row.tags) ||
      row.tags.some((tag) => !clean(tag))
    )
      throw new Error(`Incomplete submission ${row._id}.`)
    const created = Date.parse(row.createdAt)
    const updated = Date.parse(row.updatedAt || row.createdAt)
    if (
      !Number.isFinite(created) ||
      !Number.isFinite(updated) ||
      updated < created ||
      new Date(created).toISOString().slice(0, 10) !== '2026-03-19'
    )
      throw new Error(`Submission date needs event review: ${row._id}.`)
    // Account identity stays private. Matching title alone must never merge teams.
    const key = JSON.stringify([
      clean(row.authorId),
      normalized(row.title),
      normalized(row.description),
    ])
    const previous = selected.get(key)
    const newer =
      !previous ||
      updated > Date.parse(previous.updatedAt || previous.createdAt) ||
      (updated === Date.parse(previous.updatedAt || previous.createdAt) &&
        row._id > previous._id)
    if (previous)
      omitted.push({
        sourceId: newer ? previous._id : row._id,
        retainedSourceId: newer ? row._id : previous._id,
        reason:
          'Earlier duplicate with the same submitter, title and description.',
      })
    if (newer) selected.set(key, row)
  }

  const corrections = []
  const missingMedia = []
  const slugs = new Set()
  const projects = [...selected.values()]
    .sort((a, b) => a._id.localeCompare(b._id))
    .map((row) => {
      const slug = slugify(row.title)
      if (!slug || slugs.has(slug))
        throw new Error(`Project slug collision requires review: ${slug}`)
      slugs.add(slug)
      const names = [clean(row.authorName)]
      const seen = new Set([normalized(row.authorName)])
      for (const value of row.teamMembers) {
        const name = clean(value)
        const key = normalized(name)
        if (seen.has(key) || /^(me\.?|myself)$/i.test(name)) continue
        seen.add(key)
        names.push(name)
      }
      const description = summary(row.description)
      let command = clean(row.installCommand)
      if (/[\r\n`]/.test(command))
        throw new Error(`Installation command needs review: ${row._id}.`)
      if (
        row._id === 'k979gdpy3xmzarx3bxtfxrqw7h8371b8' &&
        row.githubUrl ===
          'https://github.com/maurogioberti/skill-a-thon-resume-analyzer' &&
        command ===
          'npx skills add pip install git+https://github.com/maurogioberti/skill-a-thon-resume-analyzer.git'
      ) {
        command = command.slice('npx skills add '.length)
        corrections.push({
          sourceId: row._id,
          field: 'installCommand',
          reason:
            'Removed an erroneous npx prefix; the pip command is documented in the project README.',
          sourceUrl: row.githubUrl + '#install',
        })
      }
      const sourceUrl = `${SOURCE}/projects/${row._id}`
      const links = { submission: sourceUrl }
      if (clean(row.githubUrl))
        links.github = publicUrl(
          row.githubUrl,
          new Set(['github.com', 'gist.github.com']),
        )
      const data = {
        event: EVENT,
        title: clean(row.title),
        publishedDate: new Date(row.createdAt).toISOString(),
        ...((row.updatedAt || row.createdAt) !== row.createdAt
          ? {
              modifiedDate: new Date(
                row.updatedAt || row.createdAt,
              ).toISOString(),
            }
          : {}),
        description,
        thumbnailUrl: '',
        category: 'Technology',
        status: 'published',
        contentFormat: 'markdown',
        tags: row.tags.map(clean),
        techStack: [],
        youtubeLink: '',
        hackers: names.map((name) => ({
          name,
          description: '',
          image: { src: '' },
          links: {},
        })),
        links,
      }
      const body = []
      if (clean(row.description).replace(/\s+/g, ' ') !== description)
        body.push(clean(row.description))
      if (command) body.push('## Installation\n\n```sh\n' + command + '\n```')
      const content = body.join('\n\n')
      let imageUrl
      if (
        row.mediaType &&
        !['image', 'youtube', 'vimeo'].includes(row.mediaType)
      )
        throw new Error(`Unknown media type: ${row._id}.`)
      if (row.mediaType && !clean(row.mediaUrl)) {
        missingMedia.push({
          sourceId: row._id,
          reason: `The source specifies ${row.mediaType} media but provides no URL.`,
        })
      } else if (row.mediaType === 'image') {
        imageUrl = publicUrl(row.mediaUrl, imageHosts)
      } else if (row.mediaType) {
        const url = publicUrl(row.mediaUrl)
        if (!videoEmbed(url))
          throw new Error(`Unsupported video URL: ${row._id}.`)
        data.youtubeLink = url
      }
      if (email.test(JSON.stringify({ data, content })))
        throw new Error(`Email found in public fields: ${row._id}.`)
      return { sourceId: row._id, sourceUrl, slug, data, content, imageUrl }
    })
  return {
    projects,
    omitted: omitted.sort((a, b) => a.sourceId.localeCompare(b.sourceId)),
    corrections,
    missingMedia,
  }
}

export async function buildFiles(snapshot, mediaRows, readImage, root) {
  const prepared = prepareProjects(snapshot)
  const writes = []
  const records = []
  const extensions = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  for (const project of prepared.projects) {
    let image
    if (project.imageUrl) {
      const matches = mediaRows.filter(
        (row) =>
          row.sourceId === project.sourceId &&
          row.sourceUrl === project.imageUrl,
      )
      if (
        matches.length !== 1 ||
        matches[0].status !== 200 ||
        matches[0].file !== `${project.sourceId}.bin`
      )
        throw new Error(`Missing verified media snapshot: ${project.sourceId}`)
      const capture = matches[0]
      const bytes = await readImage(capture.file)
      const type = imageType(bytes)
      const hash = createHash('sha256').update(bytes).digest('hex')
      if (!type || bytes.length > 20 * 1024 * 1024 || hash !== capture.sha256)
        throw new Error(`Invalid media snapshot: ${project.sourceId}`)
      const file = `/projects/${EVENT}/${project.slug}.${extensions[type]}`
      project.data.thumbnailUrl = file
      image = { file, sourceUrl: project.imageUrl, sha256: hash }
      writes.push({ file: path.join(root, 'public', file), bytes })
    }
    const file = path.join(root, 'projects', EVENT, `${project.slug}.md`)
    writes.push({
      file,
      bytes: await prettier.format(
        matter.stringify(project.content, project.data),
        { filepath: file, singleQuote: true },
      ),
    })
    records.push({
      sourceId: project.sourceId,
      sourceUrl: project.sourceUrl,
      slug: project.slug,
      image,
    })
  }
  const manifest = {
    source: SOURCE,
    endpoint: '/api/projects',
    event: EVENT,
    capturedAt: snapshot.capturedAt,
    sourceRows: snapshot.data.length,
    publishedProjects: prepared.projects.length,
    omitted: prepared.omitted,
    corrections: prepared.corrections,
    missingMedia: prepared.missingMedia,
    projects: records,
  }
  const file = path.join(root, 'data/skillathon-import.json')
  writes.push({
    file,
    bytes: await prettier.format(JSON.stringify(manifest), { filepath: file }),
  })
  return { writes, manifest }
}

export async function writeFiles(writes) {
  // Validate the whole batch before creating files; never replace edits silently.
  for (const { file, bytes } of writes) {
    try {
      if (!(await fs.readFile(file)).equals(Buffer.from(bytes)))
        throw new Error(
          `Existing file differs; review before replacing: ${file}`,
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
  return created
}

async function main(args) {
  const snapshotFile = args[args.indexOf('--snapshot') + 1]
  if (!args.includes('--snapshot') || !snapshotFile)
    throw new Error(
      'Usage: node scripts/import-skillathon.mjs --snapshot /private/projects.json [--media /private/media.json --apply]',
    )
  const snapshot = JSON.parse(await fs.readFile(snapshotFile, 'utf8'))
  const prepared = prepareProjects(snapshot)
  if (!args.includes('--apply')) {
    console.log(
      JSON.stringify(
        {
          event: EVENT,
          sourceRows: snapshot.data.length,
          publishedProjects: prepared.projects.length,
          omitted: prepared.omitted,
          corrections: prepared.corrections,
          missingMedia: prepared.missingMedia,
          dryRun: true,
        },
        null,
        2,
      ),
    )
    return
  }
  const mediaFile = args[args.indexOf('--media') + 1]
  if (!args.includes('--media') || !mediaFile)
    throw new Error('Applying requires the verified media snapshot.')
  const media = JSON.parse(await fs.readFile(mediaFile, 'utf8'))
  const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
  const { writes, manifest } = await buildFiles(
    snapshot,
    media,
    (file) => fs.readFile(path.join(path.dirname(mediaFile), 'images', file)),
    root,
  )
  const createdFiles = await writeFiles(writes)
  console.log(
    JSON.stringify({
      event: EVENT,
      publishedProjects: manifest.publishedProjects,
      createdFiles,
    }),
  )
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
