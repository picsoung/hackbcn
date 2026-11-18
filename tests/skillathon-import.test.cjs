const assert = require('node:assert/strict')
const fs = require('node:fs')
const fsp = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { createHash } = require('node:crypto')
const { test } = require('node:test')

require('ts-node').register({
  skipProject: true,
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
  },
})
const { getProjectsByEvent } = require('../app/helpers/projects.ts')
const {
  archivedProjectCard,
  searchProjectCards,
} = require('../lib/project-cards.ts')
const { archivedProjectContent } = require('../lib/project-detail.ts')
const { imageType } = require('../lib/live/media.ts')
const manifest = require('../data/skillathon-import.json')
const projects = getProjectsByEvent('skillathon-hacknight-2026')
const importer = () => import('../scripts/import-skillathon.mjs')

test('Skill-a-thon imports 16 event projects with original submission links and dates', () => {
  assert.equal(manifest.sourceRows, 17)
  assert.equal(manifest.publishedProjects, 16)
  assert.equal(projects.length, 16)
  assert.equal(new Set(projects.map((p) => p.slug)).size, 16)
  assert.deepEqual(
    manifest.omitted.map((p) => p.sourceId),
    ['k977k4pmzv6y4mty69cp7yf82h8372ts'],
  )
  assert.equal(
    projects.filter((p) => p.data.title === 'OpenClaw Audit').length,
    1,
  )
  assert.deepEqual(
    projects
      .find((p) => p.data.title === 'OpenClaw Audit')
      .data.hackers.map((p) => p.name),
    ['tomas'],
  )
  assert.ok(projects.some((p) => p.data.title === 'Royal Crown Lingo'))
  assert.equal(projects.filter((p) => p.data.links.github).length, 12)
  for (const project of projects) {
    assert.equal(
      project.data.publishedDate.toISOString().slice(0, 10),
      '2026-03-19',
    )
    assert.equal(project.data.contentFormat, 'markdown')
    assert.ok(project.data.description.length <= 220)
    assert.equal(
      archivedProjectCard(project, 'fr').href,
      `/fr/projects/${project.slug}`,
    )
    assert.match(
      project.data.links.submission,
      /^https:\/\/hackbarna-skillathon\.netlify\.app\/projects\/[a-z0-9]+$/,
    )
    assert.equal(archivedProjectCard(project, 'en').award, undefined)
    assert.deepEqual(project.data.techStack, [])
    assert.doesNotMatch(
      JSON.stringify(project),
      /authorEmail|authorId|upvoteCount|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    )
    for (const maker of project.data.hackers) assert.deepEqual(maker.links, {})
  }
})

test('builder credits remove explicit self-repeats while preserving submitted collaborators and search', () => {
  assert.equal(projects.flatMap((p) => p.data.hackers).length, 29)
  assert.deepEqual(
    projects
      .find((p) => p.data.title === 'Bravo to React Native')
      .data.hackers.map((m) => m.name),
    ['Toby', 'Giacomo'],
  )
  assert.deepEqual(
    projects
      .find((p) => p.data.title === 'Resume Intelligence Skills')
      .data.hackers.map((m) => m.name),
    ['Mauro Gioberti'],
  )
  assert.deepEqual(
    projects
      .find((p) => p.data.title === 'Design One-Pager')
      .data.hackers.map((m) => m.name),
    ['Colin Stark'],
  )
  assert.deepEqual(
    projects
      .find((p) => p.data.title === 'drawhub: draw on dice.fyi')
      .data.hackers.map((m) => m.name),
    ['Joe Tannoury', 'Joe'],
  )
  const cards = projects.map((p) =>
    archivedProjectCard(p, 'en', { name: 'Skill-a-thon HackNight' }),
  )
  assert.equal(
    searchProjectCards(cards, 'Wojciech Krupinski')[0].name,
    'Paradigm',
  )
  assert.equal(searchProjectCards(cards, 'Colin Stark').length, 3)
  assert.equal(searchProjectCards(cards, 'Skill-a-thon').length, 16)
  assert.equal(searchProjectCards(cards, 'skillathon').length, 16)
  assert.equal(
    searchProjectCards(cards, 'software contracts')[0].name,
    'Software Vendor Cost Optimizer',
  )
})

test('four submitted images are durable local assets and absent source media stays absent', () => {
  const images = manifest.projects.filter((p) => p.image)
  assert.equal(images.length, 4)
  for (const row of images) {
    const bytes = fs.readFileSync(
      path.join(process.cwd(), 'public', row.image.file),
    )
    assert.ok(imageType(bytes))
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      row.image.sha256,
    )
    const project = projects.find((p) => p.slug.endsWith('/' + row.slug))
    assert.equal(project.data.thumbnailUrl, row.image.file)
    assert.equal(archivedProjectContent(project).media.src, row.image.file)
  }
  assert.deepEqual(
    manifest.missingMedia.map((p) => p.sourceId),
    ['k976nbr327ycb8s82v4mmefcrs836e6m', 'k977af3z41vaz03kfqk2bxwhdh836kxy'],
  )
  for (const title of ['RoidReels', 'Software Vendor Cost Optimizer'])
    assert.equal(
      archivedProjectContent(projects.find((p) => p.data.title === title))
        .media,
      undefined,
    )
})

test('installation text is retained without duplicate prefixes and the pip correction is sourced', () => {
  assert.equal(
    projects.filter((p) => p.content.includes('## Installation')).length,
    7,
  )
  const resume = projects.find(
    (p) => p.data.title === 'Resume Intelligence Skills',
  )
  assert.match(
    resume.content,
    /```sh\npip install git\+https:\/\/github\.com\/maurogioberti\/skill-a-thon-resume-analyzer\.git\n```/,
  )
  assert.doesNotMatch(resume.content, /npx skills add pip install/)
  assert.equal(
    manifest.corrections[0].sourceUrl,
    'https://github.com/maurogioberti/skill-a-thon-resume-analyzer#install',
  )
  assert.match(
    projects.find((p) => p.data.title === 'Paradigm').content,
    /npx skills add useparadigm\/skill_a_thon/,
  )
})

function source(overrides = {}) {
  return {
    _id: 'k0000000000000001',
    authorId: 'private-account',
    authorName: 'Ada Lovelace',
    authorEmail: 'private@example.test',
    title: 'Example Skill',
    description: 'A useful reusable skill.',
    createdAt: '2026-03-19T18:00:00.000Z',
    updatedAt: '2026-03-19T18:00:00.000Z',
    tags: ['Developer Tools'],
    teamMembers: ['Ada Lovelace', 'Grace Hopper', 'me.', 'Grace Hopper'],
    githubUrl: 'https://github.com/example/skill',
    upvoteCount: 999,
    ...overrides,
  }
}
function snapshot(data) {
  return {
    sourceUrl: 'https://hackbarna-skillathon.netlify.app',
    endpoint: '/api/projects',
    event: 'skillathon-hacknight-2026',
    capturedAt: '2026-11-18T12:00:00Z',
    data,
  }
}

test('importer verifies duplicate ownership, keeps the latest revision and exports only public fields', async () => {
  const { prepareProjects } = await importer()
  const original = source()
  const latest = source({
    _id: 'k0000000000000002',
    updatedAt: '2026-03-19T19:00:00.000Z',
  })
  const result = prepareProjects(snapshot([latest, original]))
  assert.deepEqual(result, prepareProjects(snapshot([original, latest])))
  assert.equal(result.projects.length, 1)
  assert.equal(result.projects[0].sourceId, latest._id)
  assert.deepEqual(
    result.projects[0].data.hackers.map((p) => p.name),
    ['Ada Lovelace', 'Grace Hopper'],
  )
  assert.doesNotMatch(
    JSON.stringify(result),
    /private-account|private@example|authorId|authorEmail|upvoteCount|999/,
  )
  assert.throws(
    () =>
      prepareProjects(
        snapshot([original, { ...latest, authorId: 'different-account' }]),
      ),
    /collision/,
  )
  assert.throws(() => prepareProjects(snapshot([original, original])), /unique/)
})

test('importer rejects mismatched events, unsafe links, leaked text and unreviewed dates', async () => {
  const { prepareProjects } = await importer()
  assert.throws(
    () =>
      prepareProjects({
        ...snapshot([source()]),
        sourceUrl: 'https://other.example',
      }),
    /Snapshot/,
  )
  assert.throws(
    () =>
      prepareProjects(
        snapshot([
          source({
            createdAt: '2026-11-18T12:00:00Z',
            updatedAt: '2026-11-18T12:00:00Z',
          }),
        ]),
      ),
    /date needs event review/,
  )
  assert.throws(
    () => prepareProjects(snapshot([source({ _id: '../../outside' })])),
    /unique and safe/,
  )
  assert.throws(
    () =>
      prepareProjects(snapshot([source({ githubUrl: 'javascript:alert(1)' })])),
    /HTTPS/,
  )
  assert.throws(
    () =>
      prepareProjects(
        snapshot([
          source({ githubUrl: 'https://github.com.evil.example/repo' }),
        ]),
      ),
    /HTTPS/,
  )
  assert.throws(
    () =>
      prepareProjects(
        snapshot([
          source({
            mediaType: 'image',
            mediaUrl: 'https://127.0.0.1/private.png',
          }),
        ]),
      ),
    /HTTPS/,
  )
  assert.throws(
    () =>
      prepareProjects(
        snapshot([
          source({
            description:
              'Public text. '.repeat(40) + 'Contact private@example.test',
          }),
        ]),
      ),
    /Email found/,
  )
  assert.throws(
    () =>
      prepareProjects(
        snapshot([
          source({ installCommand: 'npx skills add example/skill\n```' }),
        ]),
      ),
    /command needs review/,
  )
  assert.equal(
    prepareProjects(snapshot([source({ updatedAt: undefined })])).projects[0]
      .data.modifiedDate,
    undefined,
  )
})

test('media preparation verifies exact source URLs and hashes before producing a public batch', async () => {
  const { buildFiles } = await importer()
  const image = manifest.projects.find((p) => p.image).image
  const bytes = fs.readFileSync(path.join(process.cwd(), 'public', image.file))
  const row = source({ mediaType: 'image', mediaUrl: image.sourceUrl })
  const capture = {
    sourceId: row._id,
    sourceUrl: image.sourceUrl,
    status: 200,
    file: row._id + '.bin',
    sha256: image.sha256,
  }
  const result = await buildFiles(
    snapshot([row]),
    [capture],
    async () => bytes,
    '/tmp/skillathon-test-output',
  )
  assert.equal(result.writes.length, 3)
  assert.ok(
    result.writes.every((p) =>
      p.file.startsWith('/tmp/skillathon-test-output/'),
    ),
  )
  assert.doesNotMatch(
    JSON.stringify(result.manifest),
    /private-account|authorEmail|authorId|upvoteCount/,
  )
  await assert.rejects(
    buildFiles(
      snapshot([row]),
      [{ ...capture, file: '../outside' }],
      async () => bytes,
      '/tmp/skillathon-test-output',
    ),
    /Missing verified media/,
  )
  await assert.rejects(
    buildFiles(
      snapshot([row]),
      [{ ...capture, sha256: '0'.repeat(64) }],
      async () => bytes,
      '/tmp/skillathon-test-output',
    ),
    /Invalid media/,
  )
})

test('applying is idempotent and a conflicting file aborts before creating other files', async () => {
  const { writeFiles } = await importer()
  const dir = await fsp.mkdtemp(
    path.join(os.tmpdir(), 'skillathon-import-test-'),
  )
  try {
    const existing = path.join(dir, 'existing.md'),
      fresh = path.join(dir, 'fresh.md')
    await fsp.writeFile(existing, 'Local edits')
    await assert.rejects(
      writeFiles([
        { file: fresh, bytes: 'New' },
        { file: existing, bytes: 'Replacement' },
      ]),
      /Existing file differs/,
    )
    assert.equal(fs.existsSync(fresh), false)
    assert.equal(await fsp.readFile(existing, 'utf8'), 'Local edits')
    const batch = [
      { file: existing, bytes: 'Local edits' },
      { file: fresh, bytes: 'New' },
    ]
    assert.equal(await writeFiles(batch), 1)
    assert.equal(await writeFiles(batch), 0)
  } finally {
    await fsp.rm(dir, { recursive: true, force: true })
  }
})
