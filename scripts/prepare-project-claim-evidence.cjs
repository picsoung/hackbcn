// Read private source/guest files; write keyed proofs outside the repository.
// Usage: node scripts/prepare-project-claim-evidence.cjs EVENT ATTENDEES.csv SUBMISSIONS.json OUTPUT.json
const fs = require('node:fs'),
  path = require('node:path'),
  crypto = require('node:crypto')
const {
  parseCsv,
  profileUrl,
  repositoryKey,
} = require('./enrich-aisummit26-makers.cjs')
const { nameKey } = require('./enrich-netlify-hacknight-makers.cjs')
const { matchAuthor } = require('./enrich-skillathon-makers.cjs')

function matchingRegistration(name, email, attendees, links = {}) {
  const rows = attendees.filter(
    (row) =>
      String(row.email ?? '')
        .trim()
        .toLowerCase() === email,
  )
  if (!rows.length) return false
  const key = nameKey(name)
  if (
    !rows.every((row) =>
      [
        row.name,
        `${row.first_name ?? ''} ${row.last_name ?? ''}`,
        row.first_name,
      ]
        .map(nameKey)
        .some(
          (registered) =>
            registered &&
            (registered === key ||
              (!key.includes(' ') && registered.startsWith(`${key} `))),
        ),
    )
  )
    return false
  for (const [service, column] of [
    ['linkedin', 'What is your LinkedIn profile?'],
    ['github', 'What is your GitHub username?'],
  ]) {
    const values = new Set(
      rows
        .map((row) => profileUrl(service, row[column])?.toLowerCase())
        .filter(Boolean),
    )
    if (values.size > 1) return false
    const expected = profileUrl(service, links[service])?.toLowerCase()
    if (expected && values.size && !values.has(expected)) return false
  }
  return true
}

function prepareEvidence(
  { event, projects, attendees, submissions, key, sourceDigest, manifest },
  helpers,
) {
  const {
    claimEmail,
    claimEmailHash,
    claimKeyId,
    claimRosterDigest,
    archivedProjectCard,
  } = helpers
  const byRepository = new Map()
  if (event === 'aisummit26') {
    if (!Array.isArray(submissions))
      throw new Error('Unexpected AI Summit source format')
    for (const submission of submissions) {
      const repository = repositoryKey(submission.repository)
      if (repository) byRepository.set(repository, submission)
    }
  } else if (
    event !== 'skillathon-hacknight-2026' ||
    submissions.event !== event ||
    !Array.isArray(submissions.data)
  )
    throw new Error('Unsupported event or source snapshot')
  const evidence = [],
    projectKeys = []
  let credits = 0,
    review = 0
  for (const project of projects) {
    const projectKey = `archive:${project.slug}`
    projectKeys.push(projectKey)
    credits += project.data.hackers.length
    let makers = []
    if (event === 'aisummit26') {
      const source = byRepository.get(repositoryKey(project.data.links?.github))
      if (
        !source ||
        source.makers?.length !== project.data.hackers.length ||
        source.makers.some(
          (maker, i) =>
            String(maker.name).trim() !== project.data.hackers[i].name.trim(),
        )
      ) {
        review += project.data.hackers.length
        continue
      }
      makers = source.makers
    } else {
      const selected = manifest.projects.find(
        (row) => `${event}/${row.slug}` === project.slug,
      )
      const rows = selected
        ? submissions.data.filter((row) => row._id === selected.sourceId)
        : []
      const source = rows.length === 1 ? rows[0] : null
      if (
        !source ||
        source.authorName !== project.data.hackers[0]?.name ||
        project.data.links?.submission !== selected.sourceUrl
      ) {
        review += project.data.hackers.length
        continue
      }
      makers = [{ name: source.authorName, email: source.authorEmail }]
    }
    const counts = new Map()
    for (const maker of makers) {
      const email = claimEmail(maker.email)
      if (email) counts.set(email, (counts.get(email) ?? 0) + 1)
    }
    const rosterDigest = claimRosterDigest(
      archivedProjectCard(project, 'en').hackers,
    )
    for (let index = 0; index < project.data.hackers.length; index++) {
      const maker = makers[index],
        email = claimEmail(maker?.email),
        hacker = project.data.hackers[index]
      let matched =
        !!email &&
        counts.get(email) === 1 &&
        matchingRegistration(hacker.name, email, attendees, hacker.links)
      if (
        !matched &&
        email &&
        counts.get(email) === 1 &&
        event === 'skillathon-hacknight-2026'
      ) {
        // Reuse the narrowly reviewed Joe Tann / Joe Tannoury exception.
        const match = matchAuthor(hacker.name, email, attendees)
        matched =
          match.method === 'exact-author-email' &&
          !!match.linkedin &&
          profileUrl('linkedin', hacker.links?.linkedin)?.toLowerCase() ===
            match.linkedin.toLowerCase()
      }
      if (!matched) {
        review++
        continue
      }
      evidence.push({
        projectKey,
        creditIndex: index,
        emailHash: claimEmailHash(email, key),
        rosterDigest,
        sourceDigest,
      })
    }
  }
  return {
    payload: { version: 1, keyId: claimKeyId(key), projectKeys, evidence },
    summary: {
      event,
      projects: projects.length,
      credits,
      automatic: evidence.length,
      review,
    },
  }
}

function main() {
  const [event, attendeeFile, submissionFile, output] = process.argv.slice(2)
  if (!event || !attendeeFile || !submissionFile || !output)
    throw new Error('Expected EVENT ATTENDEES.csv SUBMISSIONS.json OUTPUT.json')
  const root = path.resolve(__dirname, '..'),
    destination = path.resolve(output)
  if (destination.startsWith(`${root}${path.sep}`))
    throw new Error('Private evidence must be saved outside the repository')
  require('@next/env').loadEnvConfig(root)
  require('ts-node').register({
    skipProject: true,
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs',
      moduleResolution: 'node',
      esModuleInterop: true,
    },
  })
  const proof = require('../lib/projects/email-proof.ts')
  const key = proof.claimLookupKey()
  if (!key)
    throw new Error('Configure the private HACKBARNA_PROJECT_CLAIM_KEY first')
  const { getBuiltProjects } = require('../app/helpers/projects.ts')
  const { archivedProjectCard } = require('../lib/project-cards.ts')
  const attendeeInput = fs.readFileSync(attendeeFile)
  let attendeeFiles = [attendeeFile]
  if (attendeeFile.endsWith('.json')) {
    const manifest = JSON.parse(attendeeInput.toString('utf8'))
    if (
      !Array.isArray(manifest.files) ||
      !manifest.files.length ||
      manifest.files.length > 30 ||
      manifest.files.some(
        (file) => typeof file !== 'string' || !path.isAbsolute(file),
      )
    )
      throw new Error('Invalid private attendee-file manifest')
    attendeeFiles = manifest.files
  }
  const attendeeBytes = attendeeFiles.map((file) => fs.readFileSync(file)),
    sourceBytes = fs.readFileSync(submissionFile)
  const result = prepareEvidence(
    {
      event,
      projects: getBuiltProjects().filter(
        (project) => project.data.event === event,
      ),
      attendees: attendeeBytes.flatMap((bytes) =>
        parseCsv(bytes.toString('utf8'), ['email']),
      ),
      submissions: JSON.parse(sourceBytes.toString('utf8')),
      key,
      sourceDigest: crypto
        .createHash('sha256')
        .update(
          Buffer.concat(
            attendeeBytes.flatMap((bytes) => [bytes, Buffer.from('\0')]),
          ),
        )
        .update('\0')
        .update(sourceBytes)
        .digest('hex'),
      manifest: require('../data/skillathon-import.json'),
    },
    { ...proof, archivedProjectCard },
  )
  fs.mkdirSync(path.dirname(destination), { recursive: true, mode: 0o700 })
  const actualDestination = path.join(
    fs.realpathSync(path.dirname(destination)),
    path.basename(destination),
  )
  if (actualDestination.startsWith(`${fs.realpathSync(root)}${path.sep}`))
    throw new Error('Private evidence must be saved outside the repository')
  fs.writeFileSync(
    destination,
    JSON.stringify(result.payload, null, 2) + '\n',
    { mode: 0o600, flag: 'wx' },
  )
  console.log(JSON.stringify(result.summary))
}
module.exports = { matchingRegistration, prepareEvidence }
if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
