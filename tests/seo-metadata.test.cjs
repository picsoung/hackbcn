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
  localizedAlternates,
  localizedPageMetadata,
} = require('../lib/page-seo.ts')
const { projectMetadata } = require('../lib/project-seo.ts')

function setOrigin(t, value) {
  const previous = process.env.SITE_ORIGIN
  process.env.SITE_ORIGIN = value
  t.after(() => {
    if (previous === undefined) delete process.env.SITE_ORIGIN
    else process.env.SITE_ORIGIN = previous
  })
}

test('each translated route has its own www canonical and matching language alternatives', (t) => {
  setOrigin(t, 'https://hackbarna.com/')
  for (const path of [
    '',
    '/events',
    '/conduct',
    '/events/hacknight-3-linkup-2026',
  ]) {
    for (const locale of ['en', 'es', 'ca', 'fr']) {
      const metadata = localizedAlternates(locale, path)
      assert.equal(
        metadata.canonical,
        `https://www.hackbarna.com/${locale}${path}`,
      )
      assert.deepEqual(metadata.languages, {
        'x-default': `https://www.hackbarna.com/en${path}`,
        en: `https://www.hackbarna.com/en${path}`,
        es: `https://www.hackbarna.com/es${path}`,
        ca: `https://www.hackbarna.com/ca${path}`,
        fr: `https://www.hackbarna.com/fr${path}`,
      })
    }
  }
})

test('events and conduct metadata use the translated title and the same URL for social sharing', async (t) => {
  setOrigin(t, 'https://www.hackbarna.com')
  for (const locale of ['en', 'es', 'ca', 'fr']) {
    const messages = require(`../i18n/${locale}.json`)
    for (const [path, key] of [
      ['/events', 'events.title'],
      ['/conduct', 'conduct.title'],
    ]) {
      const metadata = await localizedPageMetadata(locale, path, key)
      assert.ok(metadata.title.includes(messages[key]))
      assert.equal(metadata.openGraph.url, metadata.alternates.canonical)
      assert.equal(metadata.twitter.title, metadata.title)
    }
  }
})

test('preview metadata stays on its deploy origin', async (t) => {
  const origin = 'https://deploy-preview-75--hackbarna.netlify.app'
  setOrigin(t, origin)
  const metadata = await localizedPageMetadata('fr', '/events', 'events.title')
  assert.equal(metadata.alternates.canonical, `${origin}/fr/events`)
  assert.equal(metadata.alternates.languages.en, `${origin}/en/events`)
  assert.equal(metadata.openGraph.url, `${origin}/fr/events`)
})

test('reported project URLs retain case-sensitive self canonicals', (t) => {
  setOrigin(t, 'https://hackbarna.com')
  for (const path of [
    '/fr/projects/Level_Access',
    '/en/projects/Meal_Matcher',
  ]) {
    const metadata = projectMetadata(path, 'Project', 'Project description')
    assert.equal(
      metadata.alternates.canonical,
      `https://www.hackbarna.com${path}`,
    )
    assert.deepEqual(metadata.alternates.languages, {})
  }
})
