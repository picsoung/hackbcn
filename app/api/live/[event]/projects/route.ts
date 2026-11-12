import { NextResponse } from 'next/server'
import { getLiveEvent } from '@/lib/live/config'
import {
  categoryLabel,
  createProject,
  listProjects,
  setVote,
} from '@/lib/live/projects'
import { validateProject } from '@/lib/live/validate'
import { ensureVoterId } from '@/lib/live/voter'

export const dynamic = 'force-dynamic'

type Params = { params: { event: string } }

export async function GET(_req: Request, { params }: Params) {
  if (!getLiveEvent(params.event))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const list = await listProjects(params.event)
  return NextResponse.json(list.map(({ id, ...rest }) => rest))
}

export async function POST(req: Request, { params }: Params) {
  const event = getLiveEvent(params.event)
  if (!event)
    return NextResponse.json(
      { errors: { form: 'Unknown event.' } },
      { status: 404 },
    )
  if (!event.open)
    return NextResponse.json(
      { errors: { form: 'Submissions are closed.' } },
      { status: 403 },
    )

  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null
  if (!body)
    return NextResponse.json(
      { errors: { form: 'Send the form as JSON.' } },
      { status: 400 },
    )
  // Honeypot: pretend it worked.
  if (typeof body.website === 'string' && body.website.trim())
    return NextResponse.json({ slug: null }, { status: 201 })

  const result = validateProject(body)
  if (!result.ok)
    return NextResponse.json({ errors: result.errors }, { status: 422 })

  const row = await createProject(event.slug, result.value)
  // The builder votes for themselves on submit, so nobody starts on zero.
  await setVote(event.slug, row.slug, ensureVoterId(), true)
  return NextResponse.json(
    {
      slug: row.slug,
      category: row.category,
      categoryLabel: categoryLabel(row.category),
    },
    { status: 201 },
  )
}
