import assert from 'node:assert/strict'
import { setTimeout } from 'node:timers/promises'

// Run against `next start` after a production build, or pass a Netlify preview
// and its metadata origin as the two arguments. Add --with-projects in an
// environment connected to Netlify Database. All requests are read-only.
const base = process.argv[2] || 'http://127.0.0.1:3100'
const origin = (process.argv[3] || 'https://www.hackbarna.com').replace(
  /\/$/,
  '',
)
const preview = new URL(origin).hostname.endsWith('.netlify.app')

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(
    ([tag]) =>
      Object.fromEntries(
        [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [
          key.toLowerCase(),
          value,
        ]),
      ),
  )
}

async function request(path, timeout = 30000) {
  return fetch(`${base}${path}`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(timeout),
  })
}

let ready = false
const readyDeadline = Date.now() + 30000
while (Date.now() < readyDeadline) {
  try {
    if ((await request('/fr/events', 1000)).status === 200) {
      ready = true
      break
    }
  } catch {}
  await setTimeout(500)
}
assert.ok(ready, `Server did not become ready: ${base}`)

async function verifyPage(path, content, translated = false) {
  const response = await request(path)
  assert.equal(response.status, 200, path)
  const html = await response.text()
  assert.equal(tags(html, 'html').length, 1, `${path}: one document element`)
  assert.equal(tags(html, 'body').length, 1, `${path}: one document body`)
  assert.equal(tags(html, 'html')[0].lang, path.split('/')[1])
  const links = tags(html, 'link')
  assert.deepEqual(
    links.filter((link) => link.rel === 'canonical').map((link) => link.href),
    [`${origin}${path}`],
    `${path}: one self-referencing canonical`,
  )
  assert.equal(
    tags(html, 'meta').find((tag) => tag.property === 'og:url')?.content,
    `${origin}${path}`,
  )
  const visibleText = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
  assert.match(visibleText, content, `${path}: server-rendered content`)
  if (translated) {
    const suffix = path.replace(/^\/(en|es|ca|fr)/, '')
    const languages = Object.fromEntries(
      links
        .filter((link) => link.rel === 'alternate' && link.hreflang)
        .map((link) => [link.hreflang, link.href]),
    )
    assert.deepEqual(
      languages,
      Object.fromEntries(
        ['x-default', 'en', 'es', 'ca', 'fr'].map((lang) => [
          lang,
          `${origin}/${lang === 'x-default' ? 'en' : lang}${suffix}`,
        ]),
      ),
      `${path}: language alternatives stay on this route`,
    )
  }
  const robots = tags(html, 'meta')
    .filter((tag) => tag.name === 'robots')
    .map((tag) => tag.content)
    .join(',')
  assert.doesNotMatch(
    robots,
    /noindex/i,
    `${path}: production page is indexable`,
  )
  if (preview)
    assert.match(response.headers.get('x-robots-tag') || '', /noindex/i)
  else
    assert.doesNotMatch(response.headers.get('x-robots-tag') || '', /noindex/i)
  console.log(`PASS ${path}`)
}

await verifyPage('/fr', /HackBarna/, true)
await verifyPage('/fr/events', /Linkup/, true)
await verifyPage('/fr/events/hacknight-3-linkup-2026', /Linkup/, true)
await verifyPage('/en/conduct', /harassment/i, true)
await verifyPage('/fr/conduct', /harcèlement/i, true)
if (process.argv.includes('--with-projects')) {
  await verifyPage('/fr/projects/Level_Access', /Level Access/)
  await verifyPage('/en/projects/Meal_Matcher', /Meal Match/)
} else {
  console.log('SKIP project pages: use --with-projects with Netlify Database')
}

for (const [path, destination] of [
  ['/events/v1-2024/conduct', '/en/conduct'],
  ['/fr/v1-2024/conduct', '/fr/conduct'],
  ['/es/aisummit25/conduct', '/es/conduct'],
]) {
  const response = await request(path)
  assert.equal(response.status, 308, `${path}: permanent redirect`)
  assert.equal(
    new URL(response.headers.get('location'), base).pathname,
    destination,
  )
  console.log(`PASS ${path} → ${destination}`)
}

for (const path of ['/xx/events', '/events/unknown/conduct']) {
  assert.equal(
    (await request(path)).status,
    404,
    `${path}: unsupported locale is not a soft 404`,
  )
  console.log(`PASS ${path} → 404`)
}
