const assert = require('node:assert/strict')
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
const {
  normalizeProjectTags,
  normalizeProjectTools,
  projectTagSearchTerms,
} = require('../lib/project-tags.ts')
const {
  projectTopics,
  projectTools,
  projectChallenges,
  eventChallengeTags,
} = require('../data/project-tags.ts')
const { getProjects } = require('../app/helpers/projects.ts')
const {
  archivedProjectCard,
  submittedProjectCard,
  searchProjectCards,
} = require('../lib/project-cards.ts')
const { projectPageCopy } = require('../data/project-page.ts')

test('tool aliases have one canonical spelling and repeated source variants make one chip', () => {
  assert.deepEqual(
    normalizeProjectTools([
      'NextJS',
      'Next.js',
      'Nextjs',
      'Node JS',
      'node.js',
      'Typescript.',
      'TS',
      'Pytorch',
      'torch',
      'Elevenlabs',
      'eleven labs',
      'N8N',
    ]),
    ['Next.js', 'Node.js', 'TypeScript', 'PyTorch', 'ElevenLabs', 'n8n'],
  )
})

test('long tooling answers become named technologies without turning prose, URLs or generic verbs into tags', () => {
  assert.deepEqual(
    normalizeProjectTools([
      'backend - python: Langgraph',
      'Anthropic\nfrontend - JS (react...)',
      'n8n → workflow engine\nHookdeck → endpoints\nGit / GitHub → version control',
    ]),
    [
      'Python',
      'LangGraph',
      'Anthropic',
      'JavaScript',
      'React',
      'n8n',
      'Hookdeck',
      'Git',
      'GitHub',
    ],
  )
  assert.deepEqual(
    normalizeProjectTools([
      'Make the next step render correctly.',
      'updates',
      'and more!',
      'https://github.com/team/React-project',
      '',
      null,
    ]),
    [],
  )
  assert.deepEqual(
    normalizeProjectTools(['OpenAI Whisper; GPT-4o-mini; Claude Code']),
    ['Whisper', 'GPT-4o mini', 'Claude Code'],
  )
})

test('challenge participation is scoped to its edition and never implies technology usage', () => {
  const tags = normalizeProjectTags({
    event: 'aisummit25',
    legacyTags: [
      'Norssken',
      'SLNG//',
      'Elevenlabs',
      'n8n',
      'Travelperk',
      'Glovo',
      'glovo',
      'None of the above',
      'Nebius',
    ],
  })
  assert.deepEqual(tags.challenges, [
    'Norrsken',
    'SLNG',
    'ElevenLabs',
    'n8n',
    'TravelPerk',
    'Glovo',
  ])
  assert.deepEqual(tags.tools, [])
  assert.deepEqual(tags.tags, [])
  assert.deepEqual(
    normalizeProjectTags({
      event: 'aisummit26',
      legacyTags: ['Norrsken - DeepFire', 'Fal.ai', 'None of the above'],
    }).challenges,
    ['Norrsken / DeepFire', 'fal.ai'],
  )
})

test('project topics and technologies normalize the same way across imported and live records', () => {
  const archived = normalizeProjectTags({
    legacyTags: [
      'Developer Tools',
      'AI/ML',
      'Utilities',
      'react',
      'typescript',
    ],
    category: 'Technology',
  })
  assert.deepEqual(archived.topics, [
    'Developer tools',
    'AI & machine learning',
    'Productivity',
  ])
  assert.deepEqual(archived.tools, ['React', 'TypeScript'])
  const submitted = submittedProjectCard(
    {
      eventSlug: 'hacknight-5-jevathon-2026',
      slug: 'sample',
      name: 'Sample',
      tagline: 'A useful demo',
      creatorName: 'Ada',
      linkedinUrl: '',
      category: 'health',
      usedLovable: true,
      createdAt: new Date('2026-11-10'),
    },
    'fr',
    { name: 'HackNight' },
  )
  assert.deepEqual(submitted.topics, ['Health & wellbeing'])
  assert.deepEqual(submitted.tools, ['Lovable'])
  assert.deepEqual(submitted.tags, ['Health & wellbeing', 'Lovable'])
})

test('archive search finds topics, tool aliases and event challenges as well as normal project information', () => {
  const card = {
    key: 'archive:sample',
    name: 'Quiet demo',
    description: 'Prototype',
    creator: 'Ada',
    hackers: [],
    eventName: 'HackNight',
    ...normalizeProjectTags({
      tools: ['fastapi', 'nextjs'],
      topics: ['devtools'],
      challenges: ['fal'],
    }),
  }
  for (const query of [
    'nextjs',
    'Next.js',
    'fast api',
    'developer tools',
    'FAL API',
    'Ada NextJS',
  ])
    assert.equal(searchProjectCards([card], query).length, 1, query)
  assert.equal(searchProjectCards([card], 'Supabase').length, 0)
  assert.ok(projectTagSearchTerms(['fal.ai']).includes('FAL API'))
})

test('every edition uses canonical, deduplicated, bounded tag labels while source metadata stays intact', () => {
  const projects = getProjects()
  const before = JSON.stringify(projects)
  const allowed = new Set(
    [...projectTopics, ...projectTools].map((t) => t.label),
  )
  for (const project of projects) {
    const card = archivedProjectCard(project, 'en')
    assert.equal(new Set(card.tags).size, card.tags.length)
    for (const label of card.tags) {
      assert.ok(allowed.has(label))
      assert.ok(label.length <= 40)
      assert.doesNotMatch(label, /[\r\n@<>]/)
    }
    for (const [field, definitions] of [
      ['topics', projectTopics],
      ['tools', projectTools],
      ['challenges', projectChallenges],
    ])
      for (const id of project.data[field] || [])
        assert.ok(
          definitions.some((d) => d.id === id),
          `${project.slug}: use a registered ${field} ID`,
        )
  }
  assert.equal(JSON.stringify(projects), before)
  const onePager = archivedProjectCard(
    projects.find(
      (p) => p.slug === 'skillathon-hacknight-2026/design-one-pager',
    ),
    'en',
  )
  assert.deepEqual(onePager.tags, ['Productivity', 'Design'])
  const meeting = archivedProjectCard(
    projects.find((p) => p.slug === 'aisummit26/ai-meeting-moderator'),
    'en',
  )
  assert.ok(meeting.challenges.includes('Nebius'))
  assert.deepEqual(meeting.tools, [])
})

test('taxonomy IDs and aliases do not silently collide and event challenge lists refer to registered IDs', () => {
  const key = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  for (const definitions of [projectTopics, projectTools, projectChallenges]) {
    assert.equal(new Set(definitions.map((d) => d.id)).size, definitions.length)
    const aliases = new Map()
    for (const d of definitions)
      for (const alias of [d.id, d.label, ...d.aliases]) {
        assert.ok(
          !aliases.has(key(alias)) || aliases.get(key(alias)) === d.id,
          alias,
        )
        aliases.set(key(alias), d.id)
      }
  }
  for (const ids of Object.values(eventChallengeTags))
    for (const id of ids) assert.ok(projectChallenges.some((d) => d.id === id))
  for (const locale of ['en', 'es', 'ca', 'fr']) {
    const copy = projectPageCopy(locale)
    assert.ok(copy.topics && copy.stack && copy.challenges)
  }
})
