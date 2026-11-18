#!/usr/bin/env node
// The attendee CSV remains private. Only normalized public LinkedIn URLs are written.
const fs = require('node:fs')
const path = require('node:path')
const matter = require('gray-matter')
const { parseCsv, profileUrl } = require('./enrich-aisummit26-makers.cjs')
const aliases = require('../data/netlify-hacknight-maker-aliases.json')
const linkedinColumn = 'What is your LinkedIn profile?'

function nameKey(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function linkedinKey(url) {
  return profileUrl('linkedin', url)?.toLowerCase()
}

function matchMaker(maker, attendees, alias) {
  if (alias) {
    if (!nameKey(alias.reason) || alias.maker !== maker.name)
      throw new Error(
        'Reviewed alias must identify the submitted maker and its evidence.',
      )
    if (alias.providedProfile) {
      const registeredName = nameKey(alias.attendeeName)
      const matching =
        registeredName &&
        attendees.filter((row) =>
          [row.name, `${row.first_name || ''} ${row.last_name || ''}`].some(
            (value) => nameKey(value) === registeredName,
          ),
        )
      const target = profileUrl('linkedin', alias.providedProfile)
      if (!matching || matching.length !== 1 || !target || !alias.evidence)
        throw new Error(
          'A supplied profile requires one matching registered full name and public evidence.',
        )
      const original = matching[0][linkedinColumn]?.trim()
      if (original && linkedinKey(original) !== linkedinKey(target))
        throw new Error(
          'Supplied profile conflicts with the registered LinkedIn URL.',
        )
      return { linkedin: target, method: 'reviewed-supplied-profile' }
    }
    const sourceKey = linkedinKey(alias.attendeeProfile)
    if (
      !sourceKey ||
      !attendees.some((row) => linkedinKey(row[linkedinColumn]) === sourceKey)
    )
      throw new Error(
        `Reviewed profile is absent from the attendee list: ${maker.name}`,
      )
    const target = profileUrl(
      'linkedin',
      alias.replacementProfile || alias.attendeeProfile,
    )
    if (!target || (alias.replacementProfile && !alias.evidence))
      throw new Error(
        'A replacement profile requires a valid public URL and evidence.',
      )
    return { linkedin: target, method: 'reviewed-name-variant' }
  }

  const key = nameKey(maker.name)
  const singleName = key && !key.includes(' ')
  const candidates = attendees.filter((row) =>
    [
      row.name,
      `${row.first_name || ''} ${row.last_name || ''}`,
      ...(singleName ? [row.first_name] : []),
    ].some((value) => nameKey(value) === key),
  )
  // Include rows without profiles when detecting ambiguity. A blank LinkedIn
  // field must never make another person with the same first name win a match.
  const identities = new Set(
    candidates.map(
      (row) =>
        nameKey(`${row.first_name || ''} ${row.last_name || ''}`) ||
        nameKey(row.name),
    ),
  )
  const profiles = new Map()
  for (const row of candidates) {
    const value = profileUrl('linkedin', row[linkedinColumn])
    if (value) profiles.set(linkedinKey(value), value)
  }
  if (identities.size > 1 || profiles.size > 1)
    return {
      reason: 'Ambiguous registered names or conflicting LinkedIn profiles.',
    }
  if (profiles.size === 1)
    return {
      linkedin: [...profiles.values()][0],
      method: singleName ? 'unique-first-name' : 'exact-name',
    }
  return {
    reason: candidates.length
      ? 'Matching registration has no usable LinkedIn URL.'
      : 'No matching registered name.',
  }
}

function enrichProject(data, attendees, project, reviewed = aliases) {
  const matches = []
  const unresolved = []
  const hackers = data.hackers.map((maker) => {
    const alias = reviewed.find(
      (entry) => entry.project === project && entry.maker === maker.name,
    )
    const result = matchMaker(maker, attendees, alias)
    if (!result.linkedin) {
      unresolved.push({ project, maker: maker.name, reason: result.reason })
      return maker
    }
    if (
      maker.links?.linkedin &&
      linkedinKey(maker.links.linkedin) !== linkedinKey(result.linkedin)
    )
      throw new Error(`Existing LinkedIn differs for ${project}: ${maker.name}`)
    matches.push({
      project,
      maker: maker.name,
      linkedin: result.linkedin,
      method: result.method,
    })
    return { ...maker, links: { ...maker.links, linkedin: result.linkedin } }
  })
  return { hackers, matches, unresolved }
}

function main() {
  const [attendeePath, mode] = process.argv.slice(2)
  if (!attendeePath || (mode && mode !== '--write'))
    throw new Error(
      'Usage: enrich-netlify-hacknight-makers.cjs /private/attendees.csv [--write]',
    )
  const attendees = parseCsv(fs.readFileSync(attendeePath, 'utf8'), [
    'name',
    'first_name',
    'last_name',
    linkedinColumn,
  ])
  const directory = path.join(__dirname, '../projects/hacknight-june-2026')
  const changes = []
  const matches = []
  const unresolved = []
  let makers = 0
  const files = fs
    .readdirSync(directory)
    .filter((name) => name.endsWith('.md'))
    .sort()
  for (const file of files) {
    const fullPath = path.join(directory, file)
    const original = fs.readFileSync(fullPath, 'utf8')
    const { data } = matter(original)
    if (data.event !== 'hacknight-june-2026')
      throw new Error('Unexpected project event.')
    const result = enrichProject(data, attendees, file.replace(/\.md$/, ''))
    makers += data.hackers.length
    matches.push(...result.matches)
    unresolved.push(...result.unresolved)
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
    if (updated === original)
      throw new Error(`Cannot locate builder credits in ${file}.`)
    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(updated))
      throw new Error(`Email found in public metadata for ${file}.`)
    changes.push({ fullPath, updated })
  }
  // Never write the CSV, an attendee object, emails or registration IDs to public files.
  if (mode === '--write')
    for (const { fullPath, updated } of changes)
      fs.writeFileSync(fullPath, updated)
  console.log(
    JSON.stringify(
      {
        mode: mode === '--write' ? 'write' : 'dry-run',
        projects: files.length,
        makers,
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

module.exports = { nameKey, matchMaker, enrichProject }
if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
