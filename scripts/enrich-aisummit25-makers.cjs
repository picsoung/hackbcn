#!/usr/bin/env node
// Private submission emails and attendee files never become public project data.
const fs = require('node:fs')
const path = require('node:path')
const matter = require('gray-matter')
const { parseMembers, prepareProjects } = require('./import-aisummit25.cjs')
const { parseCsv, profileUrl } = require('./enrich-aisummit26-makers.cjs')
const manifest = require('../data/aisummit25-import.json')

const EMAIL = /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const key = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()

function memberCredits(value) {
  const pieces = value.split(/\r?\n|[,;]|\s+&\s+/).filter((part) => part.trim())
  const credits = []
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i]
    let emails = piece.match(EMAIL) || []
    const stripped = piece.replace(EMAIL, '').replace(/[()[\]<>\s:.,\-–—]/g, '')
    const names = stripped ? parseMembers(piece) : []
    if (names.length === 1 && !emails.length && pieces[i + 1]) {
      const next = pieces[i + 1]
      if (
        !next.replace(EMAIL, '').replace(/[()[\]<>\s:.,\-–—]/g, '') &&
        (next.match(EMAIL) || []).length === 1
      ) {
        emails = next.match(EMAIL)
        i++
      }
    }
    for (const name of names)
      credits.push({
        name,
        email: names.length === 1 && emails.length === 1 ? key(emails[0]) : '',
      })
  }
  if (
    JSON.stringify(credits.map((credit) => credit.name)) !==
    JSON.stringify(parseMembers(value))
  )
    throw new Error('Individual team email assignments need review.')
  const counts = new Map()
  for (const credit of credits)
    if (credit.email)
      counts.set(credit.email, (counts.get(credit.email) || 0) + 1)
  return credits.map((credit) => ({
    ...credit,
    email: counts.get(credit.email) === 1 ? credit.email : '',
  }))
}

function profileIndex(attendees) {
  const index = new Map()
  const fields = {
    linkedin: 'What is your LinkedIn profile?',
    github: 'What is your GitHub username?',
  }
  for (const attendee of attendees) {
    const email = key(attendee.email)
    if (!email) continue
    const profiles = index.get(email) || {
      linkedin: new Map(),
      github: new Map(),
    }
    for (const [service, column] of Object.entries(fields)) {
      const url = profileUrl(service, attendee[column])
      if (url) profiles[service].set(key(url), url)
    }
    index.set(email, profiles)
  }
  return index
}

function enrichProject(data, members, attendees) {
  const credits = memberCredits(members)
  if (
    JSON.stringify(credits.map((credit) => credit.name)) !==
    JSON.stringify(data.hackers.map((maker) => maker.name))
  )
    throw new Error('Public team differs from the reviewed source.')
  const matches = [],
    unresolved = []
  const profileCounts = new Map()
  for (const credit of credits) {
    const profiles = credit.email && attendees.get(credit.email)
    if (!profiles || Object.values(profiles).some((urls) => urls.size > 1))
      continue
    for (const urls of Object.values(profiles)) {
      for (const url of urls.values())
        profileCounts.set(key(url), (profileCounts.get(key(url)) || 0) + 1)
    }
  }
  const hackers = data.hackers.map((maker, i) => {
    const profiles = credits[i].email && attendees.get(credits[i].email)
    let reason = !credits[i].email
      ? 'No unambiguous individual submission email.'
      : !profiles
        ? 'No matching registration email.'
        : ''
    if (profiles && Object.values(profiles).some((urls) => urls.size > 1))
      reason = 'Conflicting registered profiles; review needed.'
    const links =
      profiles && !reason
        ? Object.fromEntries(
            Object.entries(profiles).flatMap(([service, urls]) =>
              urls.size === 1 ? [[service, [...urls.values()][0]]] : [],
            ),
          )
        : {}
    if (!Object.keys(links).length)
      reason ||= 'Matching registration has no usable profile links.'
    if (Object.values(links).some((url) => profileCounts.get(key(url)) > 1))
      reason = 'Same profile supplied for multiple teammates; review needed.'
    if (reason) {
      unresolved.push({ maker: maker.name, reason })
      return maker
    }
    for (const [service, url] of Object.entries(links)) {
      if (
        maker.links?.[service] &&
        key(profileUrl(service, maker.links[service])) !== key(url)
      )
        throw new Error(
          'Existing maker profile conflicts with the registration.',
        )
    }
    matches.push({ maker: maker.name, method: 'exact-submission-email', links })
    return { ...maker, links: { ...maker.links, ...links } }
  })
  return { hackers, matches, unresolved }
}

function main() {
  const [snapshotPath, attendeeManifestPath, mode] = process.argv.slice(2)
  if (!snapshotPath || !attendeeManifestPath || (mode && mode !== '--write'))
    throw new Error(
      'Usage: enrich-aisummit25-makers.cjs /private/source.json /private/attendee-files.json [--write]',
    )
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
  const prepared = prepareProjects(snapshot)
  if (prepared.projects.length !== manifest.sourceRows)
    throw new Error('Submission coverage changed; review before enriching.')
  const { files } = JSON.parse(fs.readFileSync(attendeeManifestPath, 'utf8'))
  if (!Array.isArray(files) || !files.length)
    throw new Error('Missing attendee file manifest.')
  const attendees = profileIndex(
    files.flatMap((file) => parseCsv(fs.readFileSync(file, 'utf8'), ['email'])),
  )
  const changes = [],
    matches = [],
    unresolved = []
  for (const entry of manifest.projects) {
    const expected = prepared.projects.find(
      (project) =>
        project.slug === entry.slug && project.sourceRow === entry.sourceRow,
    )
    if (!expected)
      throw new Error('Project no longer matches the reviewed source manifest.')
    const file = path.join(
      __dirname,
      '../projects/aisummit25',
      entry.slug + '.md',
    )
    const original = fs.readFileSync(file, 'utf8'),
      data = matter(original).data
    if (data.event !== 'aisummit25' || data.title !== expected.data.title)
      throw new Error('Project title or event changed; review first.')
    const source = snapshot.rows.find(
      (row) => row.sourceRow === entry.sourceRow,
    )
    const result = enrichProject(data, source.members, attendees)
    matches.push(
      ...result.matches.map((match) => ({ project: entry.slug, ...match })),
    )
    unresolved.push(
      ...result.unresolved.map((credit) => ({
        project: entry.slug,
        ...credit,
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
      roster + '\n',
    )
    if (updated === original || new RegExp(EMAIL.source, 'i').test(updated))
      throw new Error('Unsafe public roster update; review first.')
    changes.push({ file, updated })
  }
  // Validate all source identities before writing; preserve descriptions and privacy settings.
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

module.exports = { memberCredits, profileIndex, enrichProject }
if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
