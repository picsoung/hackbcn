import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { Client } from 'pg'

// Disposable CI database only, never a Netlify or production URL.
const url = new URL(process.env.TEST_DATABASE_URL || '')
assert.ok(['localhost', '127.0.0.1'].includes(url.hostname))
assert.equal(url.pathname, '/hackbarna_test')
const client = new Client({ connectionString: url.href })
await client.connect()
try {
  const directory = new URL('../netlify/database/migrations/', import.meta.url)
  for (const migration of (await readdir(directory)).sort())
    await client.query(
      await readFile(new URL(`${migration}/migration.sql`, directory), 'utf8'),
    )
  console.log('Applied project migrations to disposable CI database')
} finally {
  await client.end()
}
