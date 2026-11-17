#!/usr/bin/env node
// Private inputs stay outside the repository. Only verified public profile URLs
// are written to the existing AI Summit project frontmatter.
// Usage: node scripts/enrich-aisummit26-makers.cjs <attendees.csv> <submissions.json> [--write]
const fs = require('node:fs')
const path = require('node:path')
const matter = require('gray-matter')

const fields = {
  linkedin: 'What is your LinkedIn profile?',
  github: 'What is your GitHub username?',
}

function parseCsv(text, requiredColumns = ['email', ...Object.values(fields)]) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  text = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      rows.push([...row, field])
      row = []
      field = ''
    } else field += c
  }
  if (quoted) throw new Error('Unclosed quoted field in attendee CSV.')
  if (row.length || field) rows.push([...row, field])
  const [headers = [], ...body] = rows
  for (const column of requiredColumns) {
    if (!headers.includes(column))
      throw new Error(`Missing attendee column: ${column}`)
  }
  return body
    .filter((values) => values.some((value) => value.trim()))
    .map((values) =>
      Object.fromEntries(headers.map((header, i) => [header, values[i] ?? ''])),
    )
}

const clean = (value) => (typeof value === 'string' ? value.trim() : '')
const emailKey = (value) => clean(value).toLowerCase()
const nameKey = (value) => clean(value).replace(/\s+/g, ' ')

function profileUrl(service, value) {
  value = clean(value)
  if (!value) return undefined
  if (service === 'github' && /^@?[\w-]+$/.test(value))
    value = `https://github.com/${value.replace(/^@/, '')}`
  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`,
    )
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return undefined
    if (service === 'linkedin' && /(^|\.)linkedin\.com$/i.test(url.hostname)) {
      const match = url.pathname.match(/^\/in\/([^/]+)(?:\/[a-z]{2})?\/?$/i)
      if (match && !decodeURIComponent(match[1]).includes('@'))
        return `https://www.linkedin.com/in/${match[1]}/`
    }
    if (service === 'github' && /^(www\.)?github\.com$/i.test(url.hostname)) {
      const match = url.pathname.match(/^\/([\w-]+)\/?$/)
      if (match) return `https://github.com/${match[1]}`
    }
  } catch {
    return undefined
  }
}

function repositoryKey(value) {
  try {
    const url = new URL(clean(value))
    if (!/^github\.com$/i.test(url.hostname)) return undefined
    const match = url.pathname
      .replace(/\/$/, '')
      .match(/^\/([^/]+(?:\/[^/]+)?)$/)
    return match?.[1].replace(/\.git$/i, '').toLowerCase()
  } catch {
    return undefined
  }
}

function attendeeIndex(attendees) {
  const index = new Map()
  for (const attendee of attendees) {
    const key = emailKey(attendee.email)
    if (!key) continue
    const links = Object.fromEntries(
      Object.entries(fields).flatMap(([service, column]) => {
        const url = profileUrl(service, attendee[column])
        return url ? [[service, url]] : []
      }),
    )
    const previous = index.get(key) ?? {}
    for (const [service, url] of Object.entries(links)) {
      if (
        previous[service] &&
        previous[service].toLowerCase() !== url.toLowerCase()
      )
        throw new Error(
          `Conflicting ${service} profiles for a duplicate attendee email.`,
        )
    }
    index.set(key, { ...previous, ...links })
  }
  return index
}

function enrichProject(project, submission, attendeesByEmail) {
  const makers = submission.makers ?? []
  if (
    makers.length !== project.hackers.length ||
    makers.some(
      (maker, i) => nameKey(maker.name) !== nameKey(project.hackers[i].name),
    )
  )
    throw new Error(
      'Project team differs from the selected submission. Review before importing.',
    )
  const unmatched = []
  const ambiguous = []
  const emailCounts = new Map()
  for (const maker of makers) {
    const key = emailKey(maker.email)
    if (key) emailCounts.set(key, (emailCounts.get(key) ?? 0) + 1)
  }
  let matched = 0
  const hackers = project.hackers.map((hacker, i) => {
    const key = emailKey(makers[i].email)
    if ((emailCounts.get(key) ?? 0) > 1) {
      ambiguous.push(hacker.name)
      return hacker
    }
    const links = attendeesByEmail.get(key)
    if (!links) {
      unmatched.push(hacker.name)
      return hacker
    }
    matched++
    // Never copy the attendee or submission object, including emails, into a public record.
    return { ...hacker, links: { ...hacker.links, ...links } }
  })
  return { hackers, matched, unmatched, ambiguous }
}

function main() {
  const [attendeePath, submissionPath, mode] = process.argv.slice(2)
  if (!attendeePath || !submissionPath || (mode && mode !== '--write'))
    throw new Error(
      'Usage: enrich-aisummit26-makers.cjs <attendees.csv> <submissions.json> [--write]',
    )
  const attendees = attendeeIndex(
    parseCsv(fs.readFileSync(attendeePath, 'utf8')),
  )
  const submissions = JSON.parse(fs.readFileSync(submissionPath, 'utf8'))
  // Later resubmissions replace earlier entries for the same repository, as in the archive import.
  const byRepository = new Map()
  for (const submission of submissions) {
    const key = repositoryKey(submission.repository)
    if (key) byRepository.set(key, submission)
  }
  const directory = path.join(__dirname, '../projects/aisummit26')
  const summary = {
    projects: 0,
    makers: 0,
    matched: 0,
    changedProjects: 0,
    linkedin: 0,
    github: 0,
    unmatched: [],
    ambiguous: [],
  }
  const changes = []
  for (const filename of fs
    .readdirSync(directory)
    .filter((name) => name.endsWith('.md'))
    .sort()) {
    const fullPath = path.join(directory, filename)
    const original = fs.readFileSync(fullPath, 'utf8')
    const { data } = matter(original)
    const submission = byRepository.get(repositoryKey(data.links?.github))
    if (!submission) throw new Error(`No source submission for ${filename}.`)
    const result = enrichProject(data, submission, attendees)
    summary.projects++
    summary.makers += result.hackers.length
    summary.matched += result.matched
    for (const name of result.unmatched)
      summary.unmatched.push({ project: data.title, maker: name })
    for (const name of result.ambiguous)
      summary.ambiguous.push({ project: data.title, maker: name })
    for (const hacker of result.hackers) {
      if (hacker.links?.linkedin) summary.linkedin++
      if (hacker.links?.github) summary.github++
    }
    if (JSON.stringify(result.hackers) === JSON.stringify(data.hackers))
      continue
    const roster = matter
      .stringify('', { hackers: result.hackers })
      .replace(/^---\r?\n/, '')
      .replace(/\r?\n---\s*$/, '')
    const updated = original.replace(
      /^hackers:\r?\n[\s\S]*?(?=^[\w]+:|^---$)/m,
      `${roster}\n`,
    )
    if (updated === original)
      throw new Error(`Could not locate the team block in ${filename}.`)
    if (/[\w.+%-]+@[\w.-]+\.[a-z]{2,}/i.test(updated))
      throw new Error(`Email-like content in ${filename}; refusing to write.`)
    summary.changedProjects++
    changes.push({ fullPath, updated })
  }
  // Validate the complete batch before changing any project file.
  if (mode === '--write')
    for (const { fullPath, updated } of changes)
      fs.writeFileSync(fullPath, updated)
  console.log(
    JSON.stringify(
      { mode: mode === '--write' ? 'write' : 'dry-run', ...summary },
      null,
      2,
    ),
  )
}

module.exports = {
  parseCsv,
  profileUrl,
  repositoryKey,
  attendeeIndex,
  enrichProject,
}
if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
