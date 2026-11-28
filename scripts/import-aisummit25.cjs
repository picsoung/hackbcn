#!/usr/bin/env node
// Read a private spreadsheet snapshot. Publish submitted project fields and names only.
const fs = require('node:fs/promises')
const path = require('node:path')
const { createHash } = require('node:crypto')
const matter = require('gray-matter')
const prettier = require('prettier')

const EVENT = 'aisummit25'
const SOURCE =
  'https://docs.google.com/spreadsheets/d/1HtcE1MP4NLb98KTGBEsvdGIAN6C0lm5TJEwpdtrE3Xk/edit'
const EMAIL = /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const clean = (value) => (typeof value === 'string' ? value.trim() : '')
const hasEmail = (value) => new RegExp(EMAIL.source, 'i').test(value)

function parseMembers(value) {
  const names = clean(value)
    .replace(EMAIL, '')
    .replace(/[()[\]<>]/g, '')
    .split(/\r?\n|[,;]|\s+&\s+/)
    .map((name) =>
      name
        .trim()
        .replace(/^[\s:.,\-–—]+|[\s:.,\-–—]+$/g, '')
        .replace(/\s+/g, ' '),
    )
    .filter(Boolean)
  if (
    !names.length ||
    names.some((name) => name.length > 120 || /[@<>\r\n]/.test(name))
  )
    throw new Error('Team names need individual review')
  return [...new Set(names)]
}

function slug(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function publicLink(value) {
  if (!clean(value)) return null
  const url = new URL(clean(value))
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    [...url.searchParams.keys()].some((key) =>
      /^(?:access_token|auth|api_key|password|secret|token)$/i.test(key),
    )
  )
    throw new Error('Project link needs review')
  if (url.hostname === 'will.be.add.later') return null
  return url
}

function fieldsList(value) {
  return clean(value)
    .split(',')
    .map((field) => clean(field).replace(/[ \t]+$/gm, ''))
    .filter(Boolean)
}

function prepareProjects(snapshot) {
  if (
    snapshot.version !== 1 ||
    snapshot.sourceUrl !== SOURCE ||
    snapshot.event !== EVENT ||
    snapshot.sourceSheet !== 'Submissions2' ||
    !Array.isArray(snapshot.rows)
  )
    throw new Error(
      'Snapshot is not the reviewed AI Summit 2025 submission sheet',
    )
  const ids = new Set(),
    slugs = new Set(),
    projects = [],
    missingLinks = [],
    corrections = []
  for (const row of snapshot.rows) {
    if (
      !Number.isSafeInteger(row.sourceRow) ||
      row.sourceRow < 2 ||
      ids.has(row.sourceRow)
    )
      throw new Error('Source rows must be unique')
    ids.add(row.sourceRow)
    let title = clean(row.team)
    const description = clean(row.pitch),
      content = clean(row.description)
    if (
      !title ||
      !description ||
      !content ||
      hasEmail(title + description + content)
    )
      throw new Error(
        `Public project text needs review at row ${row.sourceRow}`,
      )
    const date = clean(row.submittedAt)
    if (!/^10\/12\/2025 \d{1,2}:\d{2}:\d{2}$/.test(date))
      throw new Error(`Unexpected event date at row ${row.sourceRow}`)
    const link = publicLink(row.repository)
    // Derive a usable URL from the submitted repository for encoded team labels.
    const encodedTitle = /^[A-Za-z0-9+/]{60,}={0,2}$/.test(title)
    if (
      row.sourceRow === 15 &&
      encodedTitle &&
      link?.href === 'https://github.com/panrosk/10xCEO/' &&
      /^10x CEO\./.test(description)
    ) {
      title = '10x CEO'
      corrections.push({
        sourceRow: row.sourceRow,
        field: 'title',
        reason:
          'Use the project name explicitly given in its pitch and description instead of the encoded team label.',
      })
    }
    const slugSource =
      encodedTitle && link?.hostname === 'github.com'
        ? link.pathname.split('/').filter(Boolean)[1]
        : title
    const projectSlug = slug(slugSource || title)
    if (!projectSlug || projectSlug.length > 100 || slugs.has(projectSlug))
      throw new Error(`Project URL needs review at row ${row.sourceRow}`)
    slugs.add(projectSlug)
    const links = {}
    if (link) {
      // Preserve document/demo submissions without presenting them as GitHub repositories.
      links[
        link.hostname.toLowerCase() === 'github.com'
          ? 'github'
          : link.hostname === '1drv.ms'
            ? 'submission'
            : 'website'
      ] = link.href
    } else
      missingLinks.push({
        sourceRow: row.sourceRow,
        slug: projectSlug,
        reason: 'No usable submitted project link; placeholder omitted.',
      })
    const data = {
      event: EVENT,
      title,
      publishedDate: '2025-10-12',
      description,
      thumbnailUrl: '',
      category: 'Technology',
      status: 'published',
      contentFormat: 'markdown',
      tags: fieldsList(row.challenges),
      techStack: fieldsList(row.tools),
      youtubeLink: '',
      hackers: parseMembers(row.members).map((name) => ({
        name,
        description: '',
        image: { src: '' },
        links: {},
      })),
      links,
    }
    if (hasEmail(JSON.stringify({ data, content })))
      throw new Error(`Private contact found at row ${row.sourceRow}`)
    projects.push({
      slug: projectSlug,
      sourceRow: row.sourceRow,
      data,
      content,
    })
  }
  return { projects, missingLinks, corrections }
}

async function writeProjects(snapshot, { root, write = false }) {
  const prepared = prepareProjects(snapshot)
  const rendered = await Promise.all(
    prepared.projects.map(async (project) => ({
      ...project,
      markdown: await prettier.format(
        matter.stringify(project.content + '\n', project.data, {
          lineWidth: -1,
        }),
        { parser: 'markdown', singleQuote: true },
      ),
    })),
  )
  const manifest = {
    event: EVENT,
    sourceUrl: SOURCE,
    sourceSheet: snapshot.sourceSheet,
    sourceSheetId: snapshot.sourceSheetId,
    sourceRows: snapshot.rows.length,
    publishedProjects: rendered.length,
    builderCredits: rendered.reduce(
      (n, project) => n + project.data.hackers.length,
      0,
    ),
    missingLinks: prepared.missingLinks,
    corrections: prepared.corrections,
    projects: rendered.map((project) => ({
      sourceRow: project.sourceRow,
      slug: project.slug,
      sha256: createHash('sha256').update(project.markdown).digest('hex'),
    })),
  }
  if (write) {
    const directory = path.join(root, 'projects', EVENT)
    await fs.mkdir(directory, { recursive: true })
    // Existing curation and owner privacy decisions cannot be overwritten by re-running an import.
    for (const project of rendered) {
      const file = path.join(directory, project.slug + '.md')
      const existing = await fs.readFile(file, 'utf8').catch((error) => {
        if (error.code === 'ENOENT') return null
        throw error
      })
      if (existing !== null && existing !== project.markdown)
        throw new Error(
          `Existing project needs review before replacement: ${project.slug}`,
        )
    }
    for (const project of rendered)
      await fs.writeFile(
        path.join(directory, project.slug + '.md'),
        project.markdown,
      )
    await fs.mkdir(path.join(root, 'data'), { recursive: true })
    await fs.writeFile(
      path.join(root, 'data', 'aisummit25-import.json'),
      await prettier.format(JSON.stringify(manifest), { parser: 'json' }),
    )
  }
  return manifest
}

module.exports = { EVENT, SOURCE, parseMembers, prepareProjects, writeProjects }
if (require.main === module) {
  const [input, flag] = process.argv.slice(2)
  if (!input || (flag && flag !== '--write')) {
    console.error(
      'Usage: node scripts/import-aisummit25.cjs /private/source.json [--write]',
    )
    process.exitCode = 1
  } else
    fs.readFile(input, 'utf8')
      .then((raw) =>
        writeProjects(JSON.parse(raw), {
          root: process.cwd(),
          write: flag === '--write',
        }),
      )
      .then((manifest) =>
        console.log(
          JSON.stringify({
            projects: manifest.publishedProjects,
            builderCredits: manifest.builderCredits,
            missingLinks: manifest.missingLinks.length,
            written: flag === '--write',
          }),
        ),
      )
      .catch((error) => {
        console.error(error.message)
        process.exitCode = 1
      })
}
