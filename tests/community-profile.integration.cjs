// Runs only against the linked loopback database and a running Netlify Dev.
const path = require('node:path'),
  assert = require('node:assert/strict'),
  { randomUUID } = require('node:crypto'),
  { execFileSync } = require('node:child_process')
const root = process.cwd(),
  resolve = require('node:module')._resolveFilename
require('node:module')._resolveFilename = function (name, ...args) {
  return resolve.call(
    this,
    name.startsWith('@/') ? path.join(root, name.slice(2)) : name,
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
const detail = JSON.parse(
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
)
process.env.NETLIFY_DB_URL = detail.connection_string
require('@next/env').loadEnvConfig(root)
const { getDb } = require('../db/index.ts'),
  { identityAccounts, communityProfiles } = require('../db/schema.ts'),
  { eq } = require('drizzle-orm'),
  { getIdentityConfig } = require('../lib/auth/identity-config.ts'),
  {
    createIdentitySession,
    revokeIdentityToken,
  } = require('../lib/auth/session-store.ts')
const users = [
  {
    id: randomUUID(),
    name: 'Profile integration A',
    email: 'profile-a@example.test',
    emailVerified: true,
    avatarUrl: null,
  },
  {
    id: randomUUID(),
    name: 'Profile integration B',
    email: 'profile-b@example.test',
    emailVerified: true,
    avatarUrl: null,
  },
]
const data = {
  displayName: 'Local shared profile',
  avatarUrl: '',
  bio: 'Private profile integration fixture',
  linkedinUrl: '',
  githubUrl: 'https://github.com/picsoung',
  revision: 0,
}
;(async () => {
  try {
    const tokens = await Promise.all(
      users.map((user) =>
        createIdentitySession(getIdentityConfig(), user, {
          accessToken: 'fixture',
          expiresAt: Date.now() + 3600000,
        }),
      ),
    )
    const call = (i, method = 'GET', body, origin = 'http://localhost:8888') =>
      fetch('http://localhost:8888/api/account/profile', {
        method,
        headers: {
          cookie: 'hb_session=' + tokens[i],
          origin,
          'content-type': 'application/json',
        },
        ...(body === undefined
          ? {}
          : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
      })
    const initial = await (await call(0)).json()
    assert.equal(initial.profile.displayName, users[0].name)
    assert.equal(initial.profile.revision, 0)
    assert.ok(
      [403, 404].includes(
        (await call(0, 'PATCH', data, 'https://untrusted.example')).status,
      ),
    )
    assert.ok(
      [403, 404].includes(
        (
          await fetch('http://localhost:8888/api/account/profile', {
            method: 'PATCH',
            headers: {
              cookie: 'hb_session=' + tokens[0],
              'content-type': 'application/json',
            },
            body: JSON.stringify(data),
          })
        ).status,
      ),
    )
    const savedResponse = await call(0, 'PATCH', {
      ...data,
      accountId: users[1].id,
      email: 'should-not-save@example.test',
      role: 'admin',
    })
    assert.equal(savedResponse.status, 200)
    const saved = (await savedResponse.json()).profile
    assert.equal(saved.revision, 1)
    assert.deepEqual(Object.keys(saved).sort(), Object.keys(data).sort())
    assert.equal(
      (await (await call(1)).json()).profile.displayName,
      users[1].name,
    )
    const [row] = await getDb()
      .select()
      .from(communityProfiles)
      .where(eq(communityProfiles.accountId, users[0].id))
    assert.equal(row.displayName, data.displayName)
    const second = await call(0, 'PATCH', {
      ...saved,
      displayName: 'Latest revision',
    })
    assert.equal(second.status, 200)
    assert.equal(
      (await call(0, 'PATCH', { ...saved, displayName: 'Stale change' }))
        .status,
      409,
    )
    assert.equal(
      (
        await call(0, 'PATCH', {
          ...saved,
          githubUrl: 'https://github.com/owner/repository',
        })
      ).status,
      400,
    )
    assert.equal((await call(0, 'PATCH', 'x'.repeat(17000))).status, 413)
    const preflight = await fetch('http://localhost:8888/api/account/profile', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://digest.hackbarna.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization',
      },
    })
    assert.equal(preflight.status, 204)
    assert.equal(
      preflight.headers.get('access-control-allow-origin'),
      'https://digest.hackbarna.com',
    )
    const attacker = await fetch('http://localhost:8888/api/account/profile', {
      headers: {
        Origin: 'https://digest.hackbarna.com',
        Authorization: 'Bearer not-a-token',
      },
    })
    assert.equal(attacker.status, 401)
    const page = await (
      await fetch('http://localhost:8888/en/account', {
        headers: { cookie: 'hb_session=' + tokens[0] },
      })
    ).text()
    assert.ok(page.includes('Latest revision'))
    assert.ok(page.includes('/en/account/projects'))
    assert.ok(page.includes('LinkedIn profile URL'))
    assert.ok(!page.includes('Royal Crown Lingo'))
    const management = await (
      await fetch('http://localhost:8888/en/account/projects', {
        headers: { cookie: 'hb_session=' + tokens[0] },
      })
    ).text()
    assert.ok(
      !management.includes('Royal Crown Lingo'),
      'Editable social links must never grant project access',
    )
    assert.ok(!management.includes('Organiser tools'))
    assert.ok(management.includes('Missing a project?'))
    const authHeaders = { cookie: 'hb_session=' + tokens[0] }
    assert.equal(
      (
        await fetch('http://localhost:8888/en/account/review', {
          headers: authHeaders,
        })
      ).status,
      404,
    )
    assert.equal(
      (
        await fetch(
          'http://localhost:8888/en/account/projects/edit?project=archive%3Askillathon-hacknight-2026%2Froyal-crown-lingo',
          { headers: authHeaders },
        )
      ).status,
      404,
    )
    const publicPage = await (
      await fetch('http://localhost:8888/en', {
        headers: { cookie: 'hb_session=' + tokens[0] },
      })
    ).text()
    assert.ok(!publicPage.includes(data.bio))
    assert.ok(!publicPage.includes(users[0].email))
    // Exercise the real local Netlify Blobs adapter, not a mocked object store.
    const sharp = require('sharp')
    const image = await sharp({
      create: { width: 80, height: 60, channels: 3, background: '#254553' },
    })
      .png()
      .toBuffer()
    let imageUrl
    try {
      const upload = await fetch(
        'http://localhost:8888/api/account/media?purpose=avatar',
        {
          method: 'POST',
          headers: {
            cookie: 'hb_session=' + tokens[0],
            Origin: 'http://localhost:8888',
            'Content-Type': 'image/png',
          },
          body: image,
        },
      )
      assert.equal(upload.status, 200, await upload.clone().text())
      imageUrl = (await upload.json()).url
      assert.equal((await fetch(imageUrl)).status, 404)
      assert.equal(
        (
          await fetch(imageUrl, {
            headers: { cookie: 'hb_session=' + tokens[1] },
          })
        ).status,
        404,
      )
      const current = (await (await call(0)).json()).profile
      assert.equal(
        (await call(0, 'PATCH', { ...current, avatarUrl: imageUrl })).status,
        200,
      )
      const other = (await (await call(1)).json()).profile
      assert.equal(
        (await call(1, 'PATCH', { ...other, avatarUrl: imageUrl })).status,
        400,
      )
      const published = await fetch(imageUrl)
      assert.equal(published.status, 200)
      assert.match(published.headers.get('content-type'), /image\/webp/)
      assert.match(published.headers.get('cache-control'), /no-store/)
      assert.equal(
        (await sharp(Buffer.from(await published.arrayBuffer())).metadata())
          .width,
        512,
      )
      const discardWhileUsed = await fetch(
        'http://localhost:8888/api/account/media?asset=' +
          imageUrl.split('/').pop(),
        {
          method: 'DELETE',
          headers: {
            cookie: 'hb_session=' + tokens[0],
            Origin: 'http://localhost:8888',
          },
        },
      )
      assert.equal(discardWhileUsed.status, 409)
      console.log(
        'PASS real Netlify Blobs upload/read, staging privacy, owner binding and normalized image publication',
      )
    } finally {
      if (imageUrl) {
        await getDb()
          .update(communityProfiles)
          .set({ avatarUrl: '' })
          .where(eq(communityProfiles.accountId, users[0].id))
        const cleanup = await fetch(
          'http://localhost:8888/api/account/media?asset=' +
            imageUrl.split('/').pop(),
          {
            method: 'DELETE',
            headers: {
              cookie: 'hb_session=' + tokens[0],
              Origin: 'http://localhost:8888',
            },
          },
        )
        assert.equal(cleanup.status, 204)
        assert.equal((await fetch(imageUrl)).status, 404)
      }
    }
    await revokeIdentityToken(tokens[0])
    assert.equal((await call(0)).status, 401)
    console.log(
      'PASS: real profile persistence, account isolation, ignored owner/role injection, CSRF/CORS, concurrent saves, field/body limits, account navigation, social links granting no ownership, organiser isolation, public isolation and revocation',
    )
  } finally {
    for (const user of users) {
      await getDb()
        .delete(communityProfiles)
        .where(eq(communityProfiles.accountId, user.id))
      await getDb()
        .delete(identityAccounts)
        .where(eq(identityAccounts.id, user.id))
    }
    console.log('Removed both isolated local test accounts and profiles')
  }
})().then(
  () => process.exit(0),
  (error) => {
    console.error('Profile integration check failed:', error.message)
    process.exit(1)
  },
)
