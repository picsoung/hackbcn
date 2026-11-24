// Local Postgres only. Everything, including the isolated schema, is rolled back.
// node --conditions=react-server tests/project-visibility.integration.cjs
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const { randomUUID } = require('node:crypto')
const root = process.cwd()
const resolve = require('node:module')._resolveFilename
require('node:module')._resolveFilename = function (specifier, ...args) {
  return resolve.call(
    this,
    specifier.startsWith('@/')
      ? path.join(root, specifier.slice(2))
      : specifier,
    ...args,
  )
}
require('ts-node').register({
  skipProject: true,
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
  },
})

async function main() {
  const detail = process.env.TEST_DATABASE_URL
    ? { context: 'dev', connection_string: process.env.TEST_DATABASE_URL }
    : JSON.parse(
        execFileSync('netlify', ['db', 'connect', '--json'], {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        }),
      )
  assert.equal(detail.context, 'dev')
  assert.ok(
    ['localhost', '127.0.0.1', '[::1]'].includes(
      new URL(detail.connection_string).hostname,
    ),
    'Local database required',
  )
  const { Client } = require('pg')
  const client = new Client({ connectionString: detail.connection_string })
  await client.connect()
  try {
    await client.query('BEGIN')
    const schema = `privacy_${randomUUID().replaceAll('-', '')}`
    await client.query(`CREATE SCHEMA "${schema}"`)
    await client.query(`SET LOCAL search_path TO "${schema}"`)
    const migrations = path.join(root, 'netlify/database/migrations')
    for (const directory of fs.readdirSync(migrations).sort()) {
      const file = path.join(migrations, directory, 'migration.sql')
      if (fs.existsSync(file)) await client.query(fs.readFileSync(file, 'utf8'))
    }
    const database = require('drizzle-orm/node-postgres').drizzle({ client })
    const dbPath = require.resolve('../db/index.ts')
    require.cache[dbPath] = {
      id: dbPath,
      filename: dbPath,
      loaded: true,
      exports: { getDb: () => database },
    }
    const store = require('../lib/live/projects.ts')
    const { liveProjects } = require('../db/schema.ts')
    const { eq } = require('drizzle-orm')
    const eventSlug = 'hacknight-5-jevathon-2026'
    for (const [slug, visibility] of [
      ['shared-demo', 'public'],
      ['private-demo', 'private'],
      ['kiki', 'public'],
    ]) {
      await database.insert(liveProjects).values({
        eventSlug,
        slug,
        visibility,
        name: slug,
        tagline: `${slug} private description`,
        url: `https://${slug}.example.test`,
        creatorName: `${slug} builder`,
        creatorEmail: `${slug}@example.test`,
        linkedinUrl: '',
        shareConsent: true,
        jevAnswers: { private: slug },
        screenshotKey: `${slug}.png`,
        category: 'other',
      })
    }
    const [privateRecord] = await database
      .select({ id: liveProjects.id })
      .from(liveProjects)
      .where(eq(liveProjects.slug, 'private-demo'))
    for (const query of [
      store.listProjects(eventSlug),
      store.listAllProjects(),
      store.listProjectSitemapEntries(),
      store.exportShareable(eventSlug),
    ]) {
      const result = await query
      assert.deepEqual(
        result.map((project) => project.slug),
        ['shared-demo'],
      )
      assert.doesNotMatch(
        JSON.stringify(result),
        /private-demo|kiki|creatorEmail/,
      )
    }
    assert.deepEqual(await store.listProjectCounts(eventSlug), [
      { eventSlug, count: 2 },
    ])
    assert.deepEqual(await store.listProjectCounts('unknown-event'), [])
    assert.equal(await store.getPublicProject(eventSlug, 'private-demo'), null)
    assert.equal(await store.getJevAnswers(privateRecord.id), null)
    assert.equal(
      await store.setVote(eventSlug, 'private-demo', 'fixture-voter', true),
      null,
    )
    assert.equal(await store.addShare(eventSlug, 'private-demo'), null)
    const apiParams = { params: { event: eventSlug, project: 'private-demo' } }
    const request = new Request('http://localhost/privacy-fixture')
    const screenshot = require('../app/api/live/[event]/projects/[project]/screenshot/route.ts')
    assert.equal((await screenshot.GET(request, apiParams)).status, 404)
    for (const file of [
      '../app/api/live/[event]/projects/route.ts',
      '../app/api/live/[event]/leaderboard/route.ts',
      '../app/api/live/[event]/export/route.ts',
    ]) {
      const response = await require(file).GET(request, apiParams)
      assert.equal(response.status, 200)
      assert.match(response.headers.get('cache-control'), /no-store/)
      const body = await response.text()
      assert.match(body, /shared-demo/)
      assert.doesNotMatch(body, /private-demo|kiki|creatorEmail/)
    }
    await database
      .update(liveProjects)
      .set({ visibility: 'private' })
      .where(eq(liveProjects.slug, 'shared-demo'))
    assert.deepEqual(await store.listProjects(eventSlug), [])
    assert.deepEqual(await store.listProjectCounts(eventSlug), [
      { eventSlug, count: 2 },
    ])
    const { getEventProjects } = require('../lib/project-catalog.ts')
    const summary = await getEventProjects('en', eventSlug)
    assert.equal(summary.total, 2)
    assert.deepEqual(summary.projects, [])
    const { getBuilderCatalog } = require('../lib/builder-catalog.ts')
    assert.doesNotMatch(
      JSON.stringify(await getBuilderCatalog('en')),
      /private-demo|shared-demo builder/,
    )
    console.log(
      'PASS local Postgres: private projects retain totals, disappear from every public query, and reject votes/shares',
    )
  } finally {
    await client.query('ROLLBACK')
    await client.end()
  }
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
