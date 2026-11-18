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

const { communityMentions } = require('../data/community-mentions.ts')
const {
  testimonials,
  testimonialEvents,
  getTestimonialsForEvent,
} = require('../data/testimonials.ts')
const baselineUrls = require('./fixtures/community-posts-before-history.json')
const added = communityMentions.filter((post) => post.status === 'added')

test('historical search preserves the existing archive and adds the reviewed recaps once', () => {
  assert.equal(baselineUrls.length, 53)
  assert.deepEqual(
    testimonials.slice(0, 53).map((post) => post.url),
    baselineUrls,
  )
  assert.equal(communityMentions.length, 106)
  assert.equal(added.length, 73)
  assert.equal(testimonials.length, 126)
  assert.equal(
    new Set(testimonials.map((post) => post.url.replace(/\/$/, ''))).size,
    testimonials.length,
  )
  assert.equal(
    new Set(communityMentions.map((post) => post.url.replace(/\/$/, ''))).size,
    communityMentions.length,
  )
  assert.deepEqual(
    testimonials.slice(53).map((post) => post.url),
    added.map((post) => post.url),
  )
})

test('the smaller hack nights now have their own correctly grouped community posts', () => {
  const expected = {
    'vibecode-hacknight-2026': 2,
    'skillathon-hacknight-2026': 2,
    'hacknight-3-linkup-2026': 1,
    'hacknight-june-2026': 5,
    'netlify-barcelona-2026': 5,
    aisummit25: 6,
    aisummit26: 71,
    'hacknight-5-jevathon-2026': 13,
    'v1-2024': 21,
    'hacknight-edreams-2024': 0,
  }
  for (const [slug, count] of Object.entries(expected)) {
    assert.ok(
      testimonialEvents.some((event) => event.slug === slug),
      slug,
    )
    assert.equal(getTestimonialsForEvent(slug).length, count, slug)
  }
  assert.match(
    getTestimonialsForEvent('hacknight-june-2026').find(
      (post) => post.author === 'Hassan Nurudeen',
    ).excerpt,
    /Salon Acquisition/,
  )
  assert.match(
    getTestimonialsForEvent('hacknight-3-linkup-2026')[0].excerpt,
    /job-search/,
  )
})

test('event assignments follow the described project and venue rather than recency or a tool name', () => {
  const concept = communityMentions.find(
    (post) => post.author === 'Pieter van de Zande',
  )
  assert.equal(concept.eventSlug, 'aisummit25')
  assert.match(concept.evidence, /Glovo/)
  const lingua = communityMentions.find(
    (post) => post.author === 'Hussein AL Khafaji',
  )
  assert.equal(lingua.eventSlug, 'aisummit26')
  assert.match(lingua.summary, /Jev/)
  const duna = communityMentions.find(
    (post) => post.author === 'Duna Febré Vila',
  )
  assert.equal(duna.eventSlug, 'aisummit26')
  const asier = communityMentions.find(
    (post) => post.author === 'Asier Zapata Fernández',
  )
  assert.equal(asier.eventSlug, 'aisummit26')
  assert.deepEqual(asier.relatedEventSlugs, ['aisummit25'])
})

test('announcements, unrelated contexts and reference pages do not become new testimonials', () => {
  const urls = new Set(testimonials.map((post) => post.url))
  for (const post of communityMentions.filter(
    (post) => post.status === 'audit-only',
  )) {
    assert.ok(!urls.has(post.url), post.author)
  }
  const marc = communityMentions.find((post) => post.author === 'Marc Pous')
  assert.equal(marc.eventSlug, null)
  assert.match(marc.evidence, /not attending/)
  const edreams = communityMentions.filter(
    (post) => post.eventSlug === 'hacknight-edreams-2024',
  )
  assert.equal(edreams.length, 1)
  assert.equal(edreams[0].kind, 'event-listing')
})

test('reposts preserve the actual author and link the recovered original', () => {
  const anisa = communityMentions.find(
    (post) => post.author === 'Anisa Frasheri',
  )
  const mariana = communityMentions.find(
    (post) => post.author === 'Mariana Noriega',
  )
  assert.equal(anisa.kind, 'commentary-repost')
  assert.equal(anisa.originalPostUrl, mariana.url)
  assert.match(anisa.summary, /sharing Mariana/)
  const karthik = communityMentions.find(
    (post) => post.author === 'Karthik Puvvada',
  )
  const matt = communityMentions.find(
    (post) => post.url === karthik.originalPostUrl,
  )
  assert.equal(matt.author, 'Matt Roberts')
  assert.equal(matt.status, 'added')
  assert.equal(karthik.status, 'audit-only')
})

test('new source data contains public evidence, short paraphrases and local verified portraits only', () => {
  const slugs = new Set(testimonialEvents.map((event) => event.slug))
  for (const post of communityMentions) {
    assert.ok(post.eventSlug === null || slugs.has(post.eventSlug))
    assert.ok(post.relatedEventSlugs?.every((slug) => slugs.has(slug)) ?? true)
    assert.ok(post.evidence.length > 35, post.author)
    assert.ok(post.summary.split(/\s+/).length <= 40, post.author)
    for (const value of [
      post.url,
      post.sourceUrl,
      post.authorUrl,
      post.originalPostUrl,
    ].filter(Boolean)) {
      const url = new URL(value)
      assert.equal(url.protocol, 'https:')
      assert.equal(url.search, '')
      assert.equal(url.hash, '')
      assert.equal(url.username, '')
      assert.equal(url.password, '')
    }
    assert.doesNotMatch(
      JSON.stringify(post),
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    )
    assert.doesNotMatch(
      JSON.stringify(post),
      /componentkey|csrfToken|miniProfileUrn|creatorEmail|guest_id|rcm=|media\.licdn\.com/,
    )
    if (post.avatar)
      assert.ok(
        fs.existsSync(path.join(process.cwd(), 'public', post.avatar)),
        post.author,
      )
  }
  for (const post of testimonials.slice(53)) {
    assert.equal(post.featuredOnHome, undefined)
    assert.equal(post.publishedAt, undefined)
  }
})
