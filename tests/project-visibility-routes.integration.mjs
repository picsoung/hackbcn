import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { writeFile, unlink } from 'node:fs/promises'

// Run against a local next start in an isolated checkout. This fixture is never
// deployed and is removed even when an assertion fails. No database is required.
const base = process.argv[2] || 'http://127.0.0.1:3100'
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname))
const slug = `privacy-fixture-${randomUUID()}`
const file = new URL(`../projects/${slug}.md`, import.meta.url)

await writeFile(
  file,
  `---
title: ${slug}
description: Confidential fixture description
status: private
event: aisummit26
publishedDate: 2026-11-01
hackers:
  - name: Confidential fixture builder
---
Confidential fixture body
`,
  { flag: 'wx' },
)
try {
  const { createRequire } = await import('node:module')
  const require = createRequire(import.meta.url)
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
    getProjectsByEvent,
    getArchivedProjectCounts,
  } = require('../app/helpers/projects.ts')
  const expectedPublic = getProjectsByEvent('aisummit26').length
  const expectedTotal = getArchivedProjectCounts().aisummit26
  assert.ok(expectedTotal > expectedPublic)
  for (const locale of ['en', 'fr']) {
    const event = await fetch(`${base}/${locale}/events/aisummit26`)
    assert.equal(event.status, 200)
    const html = await event.text()
    const heading = html
      .match(/<h2\b[^>]*id="event-projects-heading"[^>]*>([\s\S]*?)<\/h2>/)?.[1]
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    assert.equal(heading, `Projects ${expectedTotal}`)
    assert.equal(
      (html.match(/data-project-card=/g) ?? []).length,
      expectedPublic,
    )
    assert.doesNotMatch(html, new RegExp(`${slug}|Confidential fixture`))
    const detail = await fetch(`${base}/${locale}/projects/${slug}`)
    assert.equal(detail.status, 404)
    assert.doesNotMatch(await detail.text(), /Confidential fixture/)
    console.log(
      `PASS ${locale}: private project counts without public HTML, metadata or a detail page`,
    )
  }
} finally {
  await unlink(file)
}
