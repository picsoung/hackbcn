import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const base = (process.argv[2] || 'http://localhost:8888').replace(/\/$/, '')
const manifest = JSON.parse(
  fs.readFileSync('data/aisummit25-import.json', 'utf8'),
)
const records = manifest.projects.map(({ slug }) => ({
  slug,
  ...matter(
    fs.readFileSync(path.join('projects/aisummit25', slug + '.md'), 'utf8'),
  ),
}))
const tasks = []
for (const locale of ['en', 'es', 'ca', 'fr']) {
  tasks.push(async () => {
    const builderPath = `/${locale}/builders/starklink-255870758bcc`
    const response = await fetch(base + builderPath, {
      signal: AbortSignal.timeout(30000),
    })
    assert.equal(response.status, 200, builderPath)
    const html = await response.text()
    assert.ok(
      html.includes(`/${locale}/projects/aisummit25/travel-tetris`),
      `${builderPath} omits Travel Tetris`,
    )
    assert.ok(
      html.includes(`/${locale}/projects/aisummit26/ling0`),
      `${builderPath} omits an existing Colin project`,
    )
  })
  tasks.push(async () => {
    for (const page of [`/${locale}/aisummit25`, `/${locale}/projects`]) {
      const response = await fetch(base + page, {
        signal: AbortSignal.timeout(30000),
      })
      assert.equal(response.status, 200, page)
      const html = await response.text()
      for (const { slug } of records)
        assert.ok(
          html.includes(`/${locale}/projects/aisummit25/${slug}`),
          `${page} omits ${slug}`,
        )
      assert.ok(html.includes('application/ld+json'), `${page} structured data`)
    }
  })
  for (const record of records)
    tasks.push(async () => {
      const url = `${base}/${locale}/projects/aisummit25/${record.slug}`
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
      assert.equal(response.status, 200, url)
      const html = await response.text()
      assert.ok(html.includes('rel="canonical"'), url)
      assert.ok(
        html.includes(`/${locale}/projects/aisummit25/${record.slug}`),
        url,
      )
      for (const maker of record.data.hackers) {
        const escaped = maker.name
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
        assert.ok(html.includes(escaped), `${url} omits builder ${maker.name}`)
        for (const link of Object.values(maker.links || {})) {
          assert.ok(
            html.includes(link.replace(/&/g, '&amp;')),
            `${url} omits a verified profile link for ${maker.name}`,
          )
        }
      }
    })
}
let next = 0
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (next < tasks.length) await tasks[next++]()
  }),
)
const sitemap = await fetch(base + '/sitemap.xml', {
  signal: AbortSignal.timeout(30000),
})
assert.equal(sitemap.status, 200)
const xml = await sitemap.text()
for (const locale of ['en', 'es', 'ca', 'fr'])
  for (const { slug } of records)
    assert.ok(
      xml.includes(`/${locale}/projects/aisummit25/${slug}`),
      `Sitemap omits ${locale}/${slug}`,
    )
console.log(
  'PASS 40 AI Summit 2025 details in all four languages, event/global grids, builder credits, canonicals and sitemap',
)
