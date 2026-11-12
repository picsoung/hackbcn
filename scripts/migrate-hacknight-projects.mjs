import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs, promisify } from 'node:util'
import { getDatabase } from '@netlify/database'
import { getStore } from '@netlify/blobs'
import { imageType } from '../lib/live/media.ts'

export const SOURCE_SITE = '3efab2ea-1013-48d7-afd5-be2dc6c4589d'
export const TARGET_SITE = '6aa92ad5-7af3-45a6-bcba-7baac9377886'
export const EVENT = 'hacknight-5-jevathon-2026'
const run = promisify(execFile)
const columns = [
  'slug',
  'name',
  'tagline',
  'url',
  'video_url',
  'screenshot_key',
  'creator_name',
  'creator_email',
  'linkedin_url',
  'share_consent',
  'used_lovable',
  'jev_usage',
  'category',
  'category_confidence',
  'jev_answers',
  'jev_model',
  'judge_impact',
  'judge_creativity',
  'judge_jev_use',
  'judge_score',
  'share_count',
  'created_at',
]

export function validateSnapshot(snapshot) {
  assert.equal(snapshot.version, 1, 'Unsupported snapshot version')
  assert.equal(snapshot.sourceSite, SOURCE_SITE, 'Unexpected source site')
  assert.equal(snapshot.event, EVENT, 'Unexpected event')
  assert.ok(
    Array.isArray(snapshot.projects) && snapshot.projects.length,
    'No projects in snapshot',
  )
  assert.ok(Array.isArray(snapshot.votes), 'Missing votes')
  const projects = new Map()
  const slugs = new Set()
  for (const p of snapshot.projects) {
    const knownColumns = new Set(['id', 'vote_count', ...columns])
    assert.ok(
      Object.keys(p).every((key) => knownColumns.has(key)),
      'Source schema has unhandled project columns',
    )
    if (p.screenshot_key) importedScreenshotKey(p.screenshot_key)
    assert.ok(
      Number.isSafeInteger(p.id) && p.id > 0 && !projects.has(p.id),
      'Invalid or repeated project ID',
    )
    assert.ok(
      typeof p.slug === 'string' &&
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) &&
        !slugs.has(p.slug),
      'Invalid or repeated project slug',
    )
    for (const field of [
      'name',
      'tagline',
      'url',
      'creator_name',
      'creator_email',
      'linkedin_url',
    ]) {
      assert.ok(
        typeof p[field] === 'string' && p[field].length,
        'Missing project field',
      )
    }
    assert.equal(typeof p.share_consent, 'boolean', 'Missing consent decision')
    assert.ok(
      Number.isSafeInteger(p.vote_count) && p.vote_count >= 0,
      'Invalid vote count',
    )
    assert.ok(
      Number.isSafeInteger(p.share_count) && p.share_count >= 0,
      'Invalid share count',
    )
    assert.ok(
      Number.isFinite(new Date(p.created_at).getTime()),
      'Invalid project date',
    )
    projects.set(p.id, { project: p, votes: 0 })
    slugs.add(p.slug)
  }
  const seenVotes = new Set()
  for (const vote of snapshot.votes) {
    assert.ok(projects.has(vote.project_id), 'Orphaned vote')
    assert.ok(
      typeof vote.voter_id === 'string' &&
        /^[a-f0-9-]{36}$/.test(vote.voter_id),
      'Invalid voter ID',
    )
    assert.ok(
      Number.isFinite(new Date(vote.created_at).getTime()),
      'Invalid vote date',
    )
    const key = `${vote.project_id}:${vote.voter_id}`
    assert.ok(!seenVotes.has(key), 'Repeated project/voter pair')
    seenVotes.add(key)
    projects.get(vote.project_id).votes++
  }
  for (const { project, votes } of projects.values()) {
    assert.equal(
      project.vote_count,
      votes,
      'Source vote total differs from vote records',
    )
  }
  return { projects: projects.size, votes: seenVotes.size }
}

export function importedScreenshotKey(key) {
  assert.ok(
    typeof key === 'string' && /^[a-z0-9-]{1,200}$/.test(key),
    'Invalid screenshot key',
  )
  return `${EVENT}/${key}`
}

async function netlifyToken() {
  if (process.env.NETLIFY_AUTH_TOKEN) return process.env.NETLIFY_AUTH_TOKEN
  const configFile =
    process.platform === 'darwin'
      ? path.join(homedir(), 'Library/Preferences/netlify/config.json')
      : path.join(
          process.env.XDG_CONFIG_HOME || path.join(homedir(), '.config'),
          'netlify/config.json',
        )
  const config = JSON.parse(await readFile(configFile, 'utf8'))
  const token = config.users?.[config.userId]?.auth?.token
  assert.ok(token, 'Log into Netlify CLI or set NETLIFY_AUTH_TOKEN')
  return token
}

async function copyScreenshots(snapshot, backup, originalBackup) {
  const keys = [
    ...new Set(snapshot.projects.map((p) => p.screenshot_key).filter(Boolean)),
  ]
  if (!keys.length) return 0
  const token = await netlifyToken()
  const source = getStore('screenshots', {
    siteID: SOURCE_SITE,
    token,
    consistency: 'strong',
  })
  const target = getStore('project-screenshots', {
    siteID: TARGET_SITE,
    token,
    consistency: 'strong',
  })
  const imageDir = backup.replace(/\.json$/, '-screenshots')
  await mkdir(imageDir, { recursive: true, mode: 0o700 })
  for (const key of keys) {
    const targetKey = importedScreenshotKey(key)
    let data
    if (originalBackup) {
      try {
        data = await readFile(
          path.join(originalBackup.replace(/\.json$/, '-screenshots'), key),
        )
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
    }
    if (!data) data = await source.get(key, { type: 'arrayBuffer' })
    assert.ok(data, 'Source screenshot is missing')
    const bytes = new Uint8Array(data)
    const contentType = imageType(bytes)
    assert.ok(contentType, 'Source screenshot has an unsupported format')
    await writeFile(path.join(imageDir, key), bytes, {
      mode: 0o600,
      flag: 'wx',
    })
    const sha256 = createHash('sha256').update(bytes).digest('hex')
    const existing = await target.get(targetKey, { type: 'arrayBuffer' })
    if (existing)
      assert.equal(
        createHash('sha256').update(new Uint8Array(existing)).digest('hex'),
        sha256,
        'Destination screenshot differs from source',
      )
    else
      await target.set(targetKey, bytes.slice().buffer, {
        metadata: { contentType, sha256 },
      })
    const copied = await target.get(targetKey, { type: 'arrayBuffer' })
    assert.ok(copied, 'Copied screenshot is missing')
    assert.equal(
      createHash('sha256').update(new Uint8Array(copied)).digest('hex'),
      sha256,
      'Screenshot checksum differs after copying',
    )
  }
  return keys.length
}

async function connection(site, branch) {
  // Credentials stay in the child-process pipe and memory, never logs or files.
  const { stdout } = await run(
    'netlify',
    ['database', 'status', '--branch', branch, '--show-credentials', '--json'],
    {
      env: { ...process.env, NETLIFY_SITE_ID: site },
      maxBuffer: 1024 * 1024,
    },
  )
  const status = JSON.parse(stdout)
  assert.ok(
    status.enabled && status.database?.connectionString,
    'Database unavailable',
  )
  return getDatabase({ connectionString: status.database.connectionString })
    .pool
}

async function takeSnapshot(pool) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')
    const projects = (await client.query('SELECT * FROM projects ORDER BY id'))
      .rows
    const votes = (await client.query('SELECT * FROM votes ORDER BY id')).rows
    await client.query('COMMIT')
    return {
      version: 1,
      sourceSite: SOURCE_SITE,
      event: EVENT,
      capturedAt: new Date().toISOString(),
      projects,
      votes,
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function importSnapshot(client, snapshot) {
  const expected = validateSnapshot(snapshot)
  // Caller owns the transaction. Lock both tables so count verification sees a stable target.
  await client.query(
    'LOCK TABLE live_projects, live_votes IN SHARE ROW EXCLUSIVE MODE',
  )
  const targetIds = new Map()
  for (const project of snapshot.projects) {
    const existing = (
      await client.query(
        'SELECT creator_email, name FROM live_projects WHERE event_slug = $1 AND slug = $2',
        [EVENT, project.slug],
      )
    ).rows[0]
    if (existing) {
      assert.ok(
        existing.creator_email === project.creator_email &&
          existing.name === project.name,
        'A destination slug belongs to a different project',
      )
    }
    const values = [
      EVENT,
      ...columns.map((key) =>
        key === 'screenshot_key'
          ? project[key]
            ? importedScreenshotKey(project[key])
            : null
          : key === 'used_lovable'
            ? (project[key] ?? false)
            : project[key],
      ),
    ]
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')
    const updates = columns
      .filter((key) => key !== 'slug')
      .map((key) => `${key} = EXCLUDED.${key}`)
      .join(', ')
    const result = await client.query(
      `INSERT INTO live_projects (event_slug, ${columns.join(', ')}) VALUES (${placeholders})
      ON CONFLICT (event_slug, slug) DO UPDATE SET ${updates} RETURNING id`,
      values,
    )
    targetIds.set(project.id, result.rows[0].id)
  }
  for (let start = 0; start < snapshot.votes.length; start += 500) {
    const batch = snapshot.votes.slice(start, start + 500)
    const params = batch.flatMap((vote) => [
      targetIds.get(vote.project_id),
      vote.voter_id,
      vote.created_at,
    ])
    const rows = batch
      .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
      .join(', ')
    await client.query(
      `INSERT INTO live_votes (project_id, voter_id, created_at) VALUES ${rows} ON CONFLICT (project_id, voter_id) DO NOTHING`,
      params,
    )
  }
  for (const project of snapshot.projects) {
    const result = await client.query(
      `UPDATE live_projects SET vote_count = (SELECT count(*)::int FROM live_votes WHERE project_id = $1)
      WHERE id = $1 RETURNING vote_count`,
      [targetIds.get(project.id)],
    )
    assert.equal(
      result.rows[0].vote_count,
      project.vote_count,
      'Destination vote total differs from source',
    )
  }
  const copied = (
    await client.query(
      `SELECT ${columns.join(', ')} FROM live_projects WHERE event_slug = $1 AND slug = ANY($2::text[])`,
      [EVENT, snapshot.projects.map((p) => p.slug)],
    )
  ).rows
  assert.equal(
    copied.length,
    snapshot.projects.length,
    'Destination project total differs from source',
  )
  for (const project of snapshot.projects) {
    const row = copied.find((p) => p.slug === project.slug)
    for (const key of columns) {
      const expectedValue =
        key === 'screenshot_key'
          ? project[key]
            ? importedScreenshotKey(project[key])
            : null
          : key === 'used_lovable'
            ? (project[key] ?? false)
            : (project[key] ?? null)
      if (key === 'created_at')
        assert.equal(
          new Date(row[key]).getTime(),
          new Date(expectedValue).getTime(),
          'Project date differs after copying',
        )
      else
        assert.deepEqual(
          row[key],
          expectedValue,
          `Copied project field differs (${key})`,
        )
    }
  }
  return expected
}

async function main() {
  const { values } = parseArgs({
    options: {
      'target-branch': { type: 'string' },
      apply: { type: 'boolean', default: false },
      snapshot: { type: 'string' },
      'backup-dir': {
        type: 'string',
        default: path.join(homedir(), '.codex/backups/hackbarna'),
      },
    },
  })
  assert.ok(
    values['target-branch'],
    'Pass an explicit --target-branch (preview branch name or production)',
  )
  let source, target
  try {
    let snapshot
    if (values.snapshot)
      snapshot = JSON.parse(await readFile(values.snapshot, 'utf8'))
    else {
      source = await connection(SOURCE_SITE, 'production')
      snapshot = await takeSnapshot(source)
    }
    const expected = validateSnapshot(snapshot)
    target = await connection(TARGET_SITE, values['target-branch'])
    const before = (
      await target.query(
        'SELECT count(*)::int AS projects, coalesce(sum(vote_count), 0)::int AS votes FROM live_projects WHERE event_slug = $1',
        [EVENT],
      )
    ).rows[0]
    if (!values.apply) {
      console.log(
        JSON.stringify({
          mode: 'dry-run',
          targetBranch: values['target-branch'],
          source: expected,
          targetBefore: before,
        }),
      )
      return
    }
    const backupDir = path.resolve(values['backup-dir'])
    assert.ok(
      !backupDir.startsWith(`${process.cwd()}${path.sep}`),
      'Store private backups outside the repository',
    )
    await mkdir(backupDir, { recursive: true, mode: 0o700 })
    const backup = path.join(
      backupDir,
      `jevathon-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
    )
    const contents = JSON.stringify(snapshot)
    await writeFile(backup, contents, { mode: 0o600, flag: 'wx' })
    const screenshots = await copyScreenshots(snapshot, backup, values.snapshot)
    const client = await target.connect()
    try {
      await client.query('BEGIN')
      const imported = await importSnapshot(client, snapshot)
      await client.query('COMMIT')
      console.log(
        JSON.stringify({
          mode: 'applied',
          targetBranch: values['target-branch'],
          imported,
          screenshots,
          backup,
          sha256: createHash('sha256').update(contents).digest('hex'),
        }),
      )
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } finally {
    await Promise.all([source?.end(), target?.end()])
  }
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  main().catch((error) => {
    // SQL/CLI errors can contain credentials or contact data. Print only safe diagnostics.
    console.error(
      error.code === 'ERR_ASSERTION'
        ? `Migration stopped: ${error.message.split('\n')[0]}`
        : `Migration failed (${error.code ?? error.name}); transaction rolled back if started.`,
    )
    process.exitCode = 1
  })
}
