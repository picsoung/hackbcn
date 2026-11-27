// Production-rendered authenticated routes against the disposable CI database.
const assert = require('node:assert/strict')
const path = require('node:path')
const { randomUUID } = require('node:crypto')
const { spawn } = require('node:child_process')
const resolve = require('node:module')._resolveFilename
require('node:module')._resolveFilename = function (request, ...args) {
  return resolve.call(
    this,
    request.startsWith('@/')
      ? path.join(process.cwd(), request.slice(2))
      : request,
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
  const url = new URL(process.env.TEST_DATABASE_URL || '')
  assert.ok(['127.0.0.1', 'localhost'].includes(url.hostname))
  assert.equal(url.pathname, '/hackbarna_test')
  const port = 3101,
    origin = `http://127.0.0.1:${port}`
  const admin = {
    id: randomUUID(),
    name: 'Organiser route fixture',
    email: 'admin-route@example.test',
    emailVerified: true,
    avatarUrl: null,
  }
  const member = {
    ...admin,
    id: randomUUID(),
    name: 'Member route fixture',
    email: 'member-route@example.test',
  }
  Object.assign(process.env, {
    NETLIFY_DB_URL: url.href,
    HACKBARNA_ORGANISER_IDS: admin.id,
    HACKBARNA_OIDC_CLIENT_ID: 'route-fixture',
    HACKBARNA_OIDC_CLIENT_SECRET: 'route-fixture-secret',
    HACKBARNA_OIDC_REDIRECT_URI: `${origin}/auth/callback`,
    HACKBARNA_SESSION_KEY: 'f'.repeat(64),
  })
  const { Pool } = require('pg'),
    pool = new Pool({ connectionString: url.href })
  const database = require('drizzle-orm/node-postgres').drizzle({
    client: pool,
  })
  const dbPath = require.resolve('../db/index.ts')
  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: { getDb: () => database },
  }
  const { createIdentitySession } = require('../lib/auth/session-store.ts')
  const { getIdentityConfig } = require('../lib/auth/identity-config.ts')
  const { identityAccounts } = require('../db/schema.ts'),
    { inArray } = require('drizzle-orm')
  let server,
    logs = ''
  try {
    const tokens = await Promise.all(
      [admin, member].map((user) =>
        createIdentitySession(getIdentityConfig(), user, {
          accessToken: 'local-route-fixture',
          expiresAt: Date.now() + 3600000,
        }),
      ),
    )
    server = spawn(
      process.execPath,
      [
        'node_modules/next/dist/bin/next',
        'start',
        '--hostname',
        '127.0.0.1',
        '--port',
        String(port),
      ],
      { env: process.env, stdio: ['ignore', 'pipe', 'pipe'] },
    )
    server.stdout.on('data', (data) => {
      logs = (logs + data).slice(-24000)
    })
    server.stderr.on('data', (data) => {
      logs = (logs + data).slice(-24000)
    })
    let ready = false
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        await fetch(`${origin}/en/account/admin`, { redirect: 'manual' })
        ready = true
        break
      } catch {}
      if (server.exitCode !== null) break
      await new Promise((done) => setTimeout(done, 200))
    }
    assert.ok(ready, 'Production route server did not start')
    const read = (route, index = 0) =>
      fetch(origin + route, {
        headers: { Cookie: `hb_session=${tokens[index]}` },
        redirect: 'manual',
      })
    assert.equal(
      (await fetch(`${origin}/en/account/admin`, { redirect: 'manual' }))
        .status,
      307,
    )
    assert.equal((await read('/en/account/admin', 1)).status, 404)
    for (const locale of ['en', 'es', 'ca', 'fr']) {
      const { organiserCopy } = require('../data/organiser.ts'),
        copy = organiserCopy(locale)
      const response = await read(`/${locale}/account/admin`),
        html = await response.text()
      assert.equal(response.status, 200)
      assert.match(html, /noindex/)
      assert.ok(html.includes(copy.projects))
      assert.ok(html.includes(copy.builders))
      assert.ok(html.includes(`/${locale}/account/review`))
      assert.ok(html.includes('name="q"'))
      assert.ok(html.includes('name="event"'))
      const buildersResponse = await read(
          `/${locale}/account/admin?tab=builders&q=Colin`,
        ),
        builders = await buildersResponse.text()
      assert.equal(buildersResponse.status, 200)
      const builderPath = `/${locale}/account/admin/builders/starklink-255870758bcc`
      assert.ok(builders.includes(builderPath))
      const detailResponse = await read(builderPath),
        detail = await detailResponse.text()
      assert.equal(detailResponse.status, 200)
      assert.ok(detail.includes('Colin Stark'))
      assert.ok(detail.includes('name="linkedinUrl"'))
      assert.ok(detail.includes('name="githubUrl"'))
      assert.ok(detail.includes(copy.save))
      assert.ok(detail.includes('Travel Tetris'))
      assert.equal((await read(builderPath, 1)).status, 404)
      const edit = await read(
          `/${locale}/account/projects/edit?project=archive%3Aaisummit25%2Ftravel-tetris`,
        ),
        editHtml = await edit.text()
      assert.equal(edit.status, 200)
      assert.ok(editHtml.includes(copy.projectHelp))
      assert.ok(editHtml.includes(copy.visibility))
      assert.ok(editHtml.includes(copy.save))
      assert.equal(
        (
          await read(
            `/${locale}/account/projects/edit?project=archive%3Aaisummit25%2Ftravel-tetris`,
            1,
          )
        ).status,
        404,
      )
    }
    const noMatches = await (
      await read('/en/account/admin?q=fixture-with-no-matching-project')
    ).text()
    assert.ok(noMatches.includes('No matches.'))
    console.log(
      'PASS production-rendered organiser lists, search, project/profile editors and access isolation in all four locales',
    )
  } catch (error) {
    console.error(logs)
    throw error
  } finally {
    if (server) {
      server.kill('SIGTERM')
      await new Promise((done) =>
        server.exitCode !== null ? done() : server.once('exit', done),
      )
    }
    await database
      .delete(identityAccounts)
      .where(inArray(identityAccounts.id, [admin.id, member.id]))
    await pool.end()
  }
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
