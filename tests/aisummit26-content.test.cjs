const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
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

const { getProjectsByEvent, getProject } = require('../app/helpers/projects.ts')
const { readMdxEvent } = require('../lib/event-content.ts')
const { getTestimonialsForEvent } = require('../data/testimonials.ts')
const { archivedProjectCard } = require('../lib/project-cards.ts')
const projects = getProjectsByEvent('aisummit26')

test('AI Summit 2026 imports distinct real submissions with complete public teams and links', () => {
  assert.equal(projects.length, 65)
  assert.equal(new Set(projects.map((p) => p.slug)).size, 65)
  assert.equal(
    new Set(
      projects.map((p) => p.data.links.github.toLowerCase().replace(/\/$/, '')),
    ).size,
    65,
  )
  assert.ok(!projects.some((p) => /NicoTest|^-$/.test(p.data.title)))
  assert.equal(projects.filter((p) => p.data.title === 'Grootguard').length, 1)
  assert.equal(
    projects.filter((p) => p.data.title === 'preply_project_learning-').length,
    1,
  )

  for (const project of projects) {
    assert.equal(project.data.contentFormat, 'markdown', project.slug)
    assert.ok(project.content.trim(), project.slug)
    assert.ok(project.data.hackers.length > 0, project.slug)
    assert.doesNotMatch(
      JSON.stringify(project),
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    )
    assert.doesNotMatch(
      JSON.stringify(project),
      /enr_person_|enr_company_|network_id|creatorEmail/,
    )
    for (const url of Object.values(project.data.links))
      assert.ok(
        ['http:', 'https:'].includes(new URL(url).protocol),
        project.slug,
      )
  }
  assert.equal(
    projects.find((p) => p.data.title === 'OffLoad').data.hackers.length,
    4,
  )
})

test('new archive cards use demo thumbnails and legacy link arrays still resolve', () => {
  const nova = projects.find((p) => p.data.title === 'Nova-Cast')
  assert.match(
    archivedProjectCard(nova, 'en').image,
    /^https:\/\/i\.ytimg\.com\//,
  )
  assert.equal(nova.data.links.github, 'https://github.com/n1n4xyz/nova-cast')
  assert.ok(
    Object.values(getProject(['DocLingo']).data.links).every(
      (url) => typeof url === 'string',
    ),
  )
})

test('AI Summit maker profiles expose only public URLs while preserving full team credits', () => {
  const makers = projects.flatMap((project) => project.data.hackers)
  assert.equal(makers.length, 144)
  assert.equal(makers.filter((maker) => maker.links?.linkedin).length, 117)
  assert.equal(makers.filter((maker) => maker.links?.github).length, 86)
  for (const maker of makers) {
    assert.doesNotMatch(
      JSON.stringify(maker),
      /email|guest_id|phone_number|approval_status|@/i,
    )
    for (const [service, url] of Object.entries(maker.links ?? {})) {
      assert.ok(['linkedin', 'github'].includes(service))
      const parsed = new URL(url)
      assert.equal(parsed.protocol, 'https:')
      assert.equal(parsed.search, '')
      assert.equal(parsed.hash, '')
      assert.equal(
        parsed.hostname,
        service === 'linkedin' ? 'www.linkedin.com' : 'github.com',
      )
    }
  }
  const meeting = projects.find((project) =>
    project.slug.endsWith('/ai-meeting-moderator'),
  )
  assert.equal(meeting.data.hackers[0].name, 'Vitaly Alt')
  assert.deepEqual(meeting.data.hackers[0].links, {
    linkedin: 'https://www.linkedin.com/in/vitalyalt/',
    github: 'https://github.com/bioztar',
  })
  assert.equal(
    meeting.data.hackers[1].links.github,
    'https://github.com/ashambalev',
  )
  assert.equal(
    meeting.data.hackers[1].links.linkedin,
    'https://www.linkedin.com/in/artem-shambalev/',
  )
  const ambiguous = projects.find((project) =>
    project.slug.endsWith('/preply-project-learning'),
  )
  assert.ok(
    ambiguous.data.hackers.every(
      (maker) => Object.keys(maker.links).length === 0,
    ),
  )
})

test('AI Summit 2026 has a credited gallery and preserves the original community portraits', () => {
  const { event } = readMdxEvent('aisummit26')
  assert.equal(event.active, false)
  assert.equal(event.gallery.length, 4)
  assert.equal(event.galleryCredit.name, 'Keig Studio')
  for (const photo of event.gallery) {
    assert.ok(
      fs.existsSync(path.join(process.cwd(), 'public', photo.src)),
      photo.src,
    )
    assert.ok(photo.alt.length > 20)
    assert.ok(photo.width > 0 && photo.height > 0)
  }
  const posts = getTestimonialsForEvent('aisummit26')
  assert.equal(posts.length, 71)
  const originalPosts = posts.slice(0, 13)
  assert.equal(originalPosts.length, 13)
  for (const post of originalPosts) {
    assert.ok(post.url.startsWith('https://'))
    assert.ok(post.position)
    assert.ok(
      fs.existsSync(path.join(process.cwd(), 'public', post.avatar)),
      post.author,
    )
  }
})
