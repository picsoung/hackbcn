import { NextResponse } from 'next/server'
import { getLiveEvent } from '@/lib/live/config'
import {
  backfill,
  categoryLabel,
  categoryLabels,
  listProjects,
} from '@/lib/live/projects'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { event: string } },
) {
  if (!getLiveEvent(params.event))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  let list = await listProjects(params.event)
  if (list.some((p) => !p.category)) {
    await backfill(list)
    list = await listProjects(params.event)
  }
  return NextResponse.json(
    {
      updatedAt: new Date().toISOString(),
      categories: categoryLabels,
      projects: list.map((p, i) => ({
        rank: i + 1,
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        creatorName: p.creatorName,
        category: p.category,
        categoryLabel: categoryLabel(p.category),
        voteCount: p.voteCount,
        shareCount: p.shareCount,
        hasVideo: Boolean(p.videoUrl),
      })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
