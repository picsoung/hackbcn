import { createHash } from 'node:crypto'
import { getConnectionString } from '@netlify/database'
import { Client } from 'pg'

// A private, one-time deployment plan. The plan contains no credentials and is
// supplied by the organiser through production environment variables.
export function privacyRestorePlan(value) {
  if (!value) return null
  const plan = JSON.parse(value)
  if (
    plan.version !== 1 ||
    !Array.isArray(plan.settings) ||
    !plan.settings.length ||
    plan.settings.length > 100
  )
    throw new Error('Invalid privacy restore plan')
  const fields = new Set(['linkedin', 'github', 'otherLinks', 'photo', 'bio'])
  for (const row of plan.settings) {
    if (
      typeof row.subjectKey !== 'string' ||
      row.subjectKey.length > 500 ||
      !/^(project|builder|credit):[a-zA-Z0-9_:/-]+$/.test(row.subjectKey) ||
      typeof row.hidden !== 'boolean' ||
      !Array.isArray(row.hiddenFields) ||
      row.hiddenFields.some((field) => !fields.has(field))
    )
      throw new Error('Invalid privacy restore setting')
  }
  return {
    ...plan,
    id: createHash('sha256').update(JSON.stringify(plan)).digest('hex'),
  }
}

export async function restorePrivacy(client, plan, actorId) {
  await client.query('BEGIN')
  try {
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext('hackbarna-deployment-privacy-v1'))",
    )
    await client.query(
      'CREATE TABLE IF NOT EXISTS deployment_operations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
    )
    if (
      (
        await client.query('SELECT id FROM deployment_operations WHERE id=$1', [
          plan.id,
        ])
      ).rowCount
    ) {
      await client.query('COMMIT')
      return 0
    }
    const actor = await client.query(
      'SELECT id FROM identity_accounts WHERE id=$1 AND email_verified=true',
      [actorId],
    )
    if (actor.rowCount !== 1) throw new Error('Verified organiser missing')
    for (const row of plan.settings) {
      const previous = (
        await client.query(
          'SELECT hidden, hidden_fields, revision FROM creator_privacy WHERE subject_key=$1 FOR UPDATE',
          [row.subjectKey],
        )
      ).rows[0]
      const hidden = row.hidden || previous?.hidden || false
      const hiddenFields = [
        ...new Set([...(previous?.hidden_fields ?? []), ...row.hiddenFields]),
      ]
      const revision = (previous?.revision ?? 0) + 1
      await client.query(
        'INSERT INTO creator_privacy (subject_key,hidden,hidden_fields,revision,updated_by) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (subject_key) DO UPDATE SET hidden=EXCLUDED.hidden,hidden_fields=EXCLUDED.hidden_fields,revision=EXCLUDED.revision,updated_by=EXCLUDED.updated_by,updated_at=now()',
        [row.subjectKey, hidden, hiddenFields, revision, actorId],
      )
      await client.query(
        'INSERT INTO creator_privacy_history (subject_key,hidden,hidden_fields,revision,actor_id) VALUES ($1,$2,$3,$4,$5)',
        [row.subjectKey, hidden, hiddenFields, revision, actorId],
      )
    }
    await client.query('INSERT INTO deployment_operations (id) VALUES ($1)', [
      plan.id,
    ])
    await client.query('COMMIT')
    return plan.settings.length
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

if (
  process.env.CONTEXT === 'production' &&
  process.env.HACKBARNA_DEPLOYMENT_PRIVACY_PLAN
) {
  const client = new Client({ connectionString: getConnectionString() })
  try {
    const plan = privacyRestorePlan(
      process.env.HACKBARNA_DEPLOYMENT_PRIVACY_PLAN,
    )
    await client.connect()
    const count = await restorePrivacy(
      client,
      plan,
      process.env.HACKBARNA_OWNER_ID,
    )
    console.log(`Preserved ${count} deployment privacy settings`)
  } catch {
    console.error(
      'Production privacy reconciliation failed; deployment stopped',
    )
    process.exitCode = 1
  } finally {
    await client.end()
  }
}
