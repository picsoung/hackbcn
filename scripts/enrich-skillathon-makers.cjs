#!/usr/bin/env node
// Private attendee and source files stay outside Git. Export public profiles only.
const fs = require('node:fs')
const path = require('node:path')
const matter = require('gray-matter')
const { parseCsv, profileUrl } = require('./enrich-aisummit26-makers.cjs')
const { nameKey, matchMaker } = require('./enrich-netlify-hacknight-makers.cjs')
const manifest = require('../data/skillathon-import.json')
const linkedinColumn = 'What is your LinkedIn profile?'

// Registration abbreviates the surname. This exception still requires the
// submission's exact account email to match that registration and profile.
const authorAliases = {
  'Joe Tannoury': 'https://www.linkedin.com/in/joetann/',
}

function compatibleName(name, row) {
  const key = nameKey(name)
  return [
    row.name,
    `${row.first_name || ''} ${row.last_name || ''}`,
    row.first_name,
  ]
    .map(nameKey)
    .some(
      (registered) =>
        registered && (registered === key || registered.startsWith(`${key} `)),
    )
}

function matchAuthor(name, email, attendees, aliases = authorAliases) {
  const key = String(email || '')
    .trim()
    .toLowerCase()
  const rows = key
    ? attendees.filter((row) => row.email?.trim().toLowerCase() === key)
    : []
  if (!rows.length) return matchMaker({ name }, attendees)
  const profiles = new Set(
    rows
      .map((row) => profileUrl('linkedin', row[linkedinColumn]))
      .filter(Boolean)
      .map((url) => url.toLowerCase()),
  )
  if (profiles.size > 1)
    return { reason: 'Conflicting profiles for the submitting account.' }
  if (
    !rows.every(
      (row) =>
        compatibleName(name, row) ||
        (aliases[name] &&
          profileUrl('linkedin', row[linkedinColumn])?.toLowerCase() ===
            aliases[name].toLowerCase()),
    )
  )
    return { reason: 'Submitting account registration has a different name.' }
  const linkedin = rows
    .map((row) => profileUrl('linkedin', row[linkedinColumn]))
    .find(Boolean)
  return linkedin
    ? { linkedin, method: 'exact-author-email' }
    : { reason: 'Matching registration has no usable LinkedIn URL.' }
}

function enrichProject(data, source, attendees) {
  if (!data.hackers?.length || data.hackers[0].name !== source.authorName)
    throw new Error('Source author does not match the first submitted credit.')
  const matches = []
  const unresolved = []
  const assigned = new Set()
  const hackers = data.hackers.map((maker, index) => {
    // Source email belongs only to the submitter, never to their teammates.
    const result =
      index === 0
        ? matchAuthor(maker.name, source.authorEmail, attendees)
        : matchMaker(maker, attendees)
    const profile = result.linkedin?.toLowerCase()
    if (!profile || assigned.has(profile)) {
      unresolved.push({
        maker: maker.name,
        reason: profile
          ? 'Profile already belongs to another credit on this project.'
          : result.reason,
      })
      return maker
    }
    const previous = profileUrl('linkedin', maker.links?.linkedin)
    if (maker.links?.linkedin && previous?.toLowerCase() !== profile)
      throw new Error(
        'Existing builder profile conflicts with the attendee match.',
      )
    assigned.add(profile)
    matches.push({ maker: maker.name, ...result })
    return { ...maker, links: { ...maker.links, linkedin: result.linkedin } }
  })
  return { hackers, matches, unresolved }
}

function main() {
  const [csvPath, snapshotPath, mode] = process.argv.slice(2)
  if (!csvPath || !snapshotPath || (mode && mode !== '--write'))
    throw new Error(
      'Usage: enrich-skillathon-makers.cjs /private/attendees.csv /private/projects.json [--write]',
    )
  const attendees = parseCsv(fs.readFileSync(csvPath, 'utf8'), [
    'email',
    'name',
    'first_name',
    'last_name',
    linkedinColumn,
  ])
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
  if (
    snapshot.sourceUrl !== manifest.source ||
    snapshot.event !== manifest.event ||
    snapshot.endpoint !== manifest.endpoint
  )
    throw new Error('Unexpected source snapshot.')
  const changes = []
  const matches = []
  const unresolved = []
  for (const project of manifest.projects) {
    const sources = snapshot.data.filter((row) => row._id === project.sourceId)
    if (sources.length !== 1)
      throw new Error('Missing or repeated source project.')
    const file = path.join(
      __dirname,
      '../projects',
      manifest.event,
      `${project.slug}.md`,
    )
    const original = fs.readFileSync(file, 'utf8')
    const data = matter(original).data
    if (
      data.event !== manifest.event ||
      data.title !== sources[0].title ||
      data.links?.submission !== project.sourceUrl
    )
      throw new Error('Source and archived project differ.')
    const result = enrichProject(data, sources[0], attendees)
    matches.push(
      ...result.matches.map((entry) => ({ project: project.slug, ...entry })),
    )
    unresolved.push(
      ...result.unresolved.map((entry) => ({
        project: project.slug,
        ...entry,
      })),
    )
    if (JSON.stringify(data.hackers) === JSON.stringify(result.hackers))
      continue
    const roster = matter
      .stringify('', { hackers: result.hackers })
      .replace(/^---\r?\n/, '')
      .replace(/\r?\n---\s*$/, '')
    const updated = original.replace(
      /^hackers:\r?\n[\s\S]*?(?=^[\w]+:|^---$)/m,
      `${roster}\n`,
    )
    if (updated === original) throw new Error('Cannot locate builder credits.')
    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(updated))
      throw new Error('Email found in public project metadata.')
    changes.push({ file, updated })
  }
  // Finish validation for the complete batch before making any writes.
  if (mode === '--write')
    for (const { file, updated } of changes) fs.writeFileSync(file, updated)
  console.log(
    JSON.stringify(
      {
        mode: mode || 'dry-run',
        changedProjects: changes.length,
        matched: matches.length,
        matches,
        unresolved,
      },
      null,
      2,
    ),
  )
}

module.exports = { compatibleName, matchAuthor, enrichProject }
if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
