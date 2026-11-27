import assert from 'node:assert/strict'

const base = (process.argv[2] || 'http://localhost:8888').replace(/\/$/, '')
const winners = [
  { slug: 'candit', award: 'Grand prize' },
  { slug: 'AQ-App', award: 'Replexica' },
  { slug: 'Eloquent_AI', award: 'Hookdeck' },
]
const labels = {
  en: 'Prize winner',
  es: 'Proyecto premiado',
  ca: 'Projecte premiat',
  fr: 'Projet primé',
}
async function page(path) {
  const response = await fetch(base + path, {
    signal: AbortSignal.timeout(30000),
  })
  assert.equal(response.status, 200, path)
  return response.text()
}

for (const [locale, label] of Object.entries(labels)) {
  for (const { slug, award } of winners) {
    const path = `/${locale}/projects/${slug}`
    const html = await page(path)
    const banner = html.match(
      /<div\b[^>]*data-project-award="detail"[^>]*>([\s\S]*?)<\/div><\/div>/,
    )?.[1]
    assert.ok(banner?.includes(label), `${path}: localized prize recognition`)
    assert.ok(banner.includes(award), `${path}: actual prize label`)
    const sidebar = Array.from(
      html.matchAll(/<aside\b[^>]*>([\s\S]*?)<\/aside>/g),
      (match) => match[1],
    ).find((content) => content.includes('id="project-builders-heading"'))
    assert.ok(
      sidebar?.includes('data-project-award="detail"'),
      `${path}: prize in the builder sidebar`,
    )
    assert.ok(
      sidebar.indexOf('data-project-award="detail"') <
        sidebar.indexOf('id="project-builders-heading"'),
      `${path}: prize before Built by`,
    )
    assert.ok(
      html.indexOf('data-project-award="detail"') > html.indexOf('<h1'),
      `${path}: prize outside the title header`,
    )
    assert.ok(
      html.includes(`"award":"${award}"`),
      `${path}: structured award data`,
    )
  }
  const ordinary = await page(`/${locale}/projects/aisummit25/10xceo`)
  assert.doesNotMatch(ordinary, /data-project-award="detail"/)
  for (const path of [`/${locale}/projects`, `/${locale}/v1-2024`]) {
    const html = await page(path)
    for (const { slug, award } of winners) {
      const start = html.indexOf(`data-project-card="archive:${slug}"`)
      assert.ok(start >= 0, `${path}: ${slug} card`)
      const next = html.indexOf('data-project-card=', start + 1)
      const card = html.slice(start, next < 0 ? undefined : next)
      assert.ok(
        card.includes('data-project-award="card"'),
        `${path}: ${slug} prize band`,
      )
      assert.ok(
        card.includes(label) && card.includes(award),
        `${path}: ${slug} localized prize label`,
      )
    }
  }
}
console.log(
  'PASS prize recognition on winning cards and details in all four locales, with ordinary projects left unmarked',
)
