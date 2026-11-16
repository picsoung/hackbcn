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

test('AI Summit 2026 has a credited gallery and all thirteen sourced community posts', () => {
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
  assert.equal(posts.length, 13)
  for (const post of posts) {
    assert.ok(post.url.startsWith('https://'))
    assert.ok(post.position)
    assert.ok(
      fs.existsSync(path.join(process.cwd(), 'public', post.avatar)),
      post.author,
    )
  }
})
