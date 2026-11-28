import assert from 'node:assert/strict'

const base = (process.argv[2] || 'http://localhost:8888').replace(/\/$/, '')
const cases = [
  {
    path: '/projects/aisummit25/10xceo',
    tools: [
      'Python',
      'LangGraph',
      'FastAPI',
      'Redis',
      'FAISS',
      'OpenAI',
      'Anthropic',
      'JavaScript',
      'React',
    ],
    challenges: ['TravelPerk', 'n8n', 'Norrsken', 'Lovable', 'SLNG', 'VEED'],
    topics: [],
  },
  {
    path: '/projects/skillathon-hacknight-2026/design-one-pager',
    topics: ['Productivity', 'Design'],
    tools: [],
    challenges: [],
  },
  {
    path: '/projects/aisummit26/ai-meeting-moderator',
    topics: [],
    tools: [],
    challenges: [
      'Nebius',
      'QualityClouds',
      'SLNG',
      'Galtea',
      'Mastra',
      'fal.ai',
    ],
  },
  { path: '/projects/AQ-App', topics: [], tools: ['Groq'], challenges: [] },
]
const headings = {
  en: { topics: 'Topics', stack: 'Built with', challenges: 'Event challenges' },
  es: { topics: 'Temas', stack: 'Tecnologías', challenges: 'Retos del evento' },
  ca: {
    topics: 'Temes',
    stack: 'Tecnologies',
    challenges: 'Reptes de l’esdeveniment',
  },
  fr: {
    topics: 'Thèmes',
    stack: 'Technologies',
    challenges: 'Défis de l’événement',
  },
}
for (const [locale, titles] of Object.entries(headings)) {
  for (const entry of cases) {
    const path = `/${locale}${entry.path}`
    const response = await fetch(base + path, {
      signal: AbortSignal.timeout(30000),
    })
    assert.equal(response.status, 200, path)
    const html = await response.text()
    for (const [id, tags] of [
      ['topics', entry.topics],
      ['stack', entry.tools],
      ['challenges', entry.challenges],
    ]) {
      const section = html.match(
        new RegExp(
          `<section[^>]+aria-labelledby="project-${id}-heading"[^>]*>([\\s\\S]*?)</section>`,
        ),
      )?.[1]
      if (!tags.length) {
        assert.equal(section, undefined, `${path}: empty ${id} group`)
        continue
      }
      assert.ok(
        section?.includes(titles[id]),
        `${path}: translated ${id} heading`,
      )
      const actual = Array.from(
        section.matchAll(/<li\b[^>]*>([^<]*)<\/li>/g),
        (match) => match[1].replace(/&amp;/g, '&'),
      )
      assert.deepEqual(actual, tags, `${path}: ${id} labels`)
    }
    assert.ok(
      html.includes('"keywords"') || html.includes('\\"keywords\\"'),
      `${path}: structured keywords`,
    )
  }
}
console.log(
  'PASS canonical topic, tool and challenge groups across all four locales and archived event formats',
)
