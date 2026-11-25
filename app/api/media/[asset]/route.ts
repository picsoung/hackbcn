import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { mediaAssets } from '@/db/schema'
import { getCurrentIdentity } from '@/lib/auth/identity-server'
import { assetPattern } from '@/lib/media/shared'
import { canReadMedia, mediaStore, publicMedia } from '@/lib/media/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function GET(
  _request: Request,
  { params }: { params: { asset: string } },
) {
  const headers = {
    'Cache-Control': 'private, no-store',
    Vary: 'Cookie',
    'X-Content-Type-Options': 'nosniff',
  }
  if (!assetPattern.test(params.asset))
    return new Response('Not found', { status: 404, headers })
  try {
    const [asset] = await getDb()
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, params.asset))
    if (
      !asset ||
      !(
        (await publicMedia(asset)) ||
        (await canReadMedia(asset, await getCurrentIdentity()))
      )
    )
      return new Response('Not found', { status: 404, headers })
    const bytes = await mediaStore().get(`${asset.id}.webp`, {
      type: 'arrayBuffer',
    })
    return bytes
      ? new Response(bytes, {
          headers: { ...headers, 'Content-Type': 'image/webp' },
        })
      : new Response('Not found', { status: 404, headers })
  } catch {
    return new Response('Image unavailable', { status: 503, headers })
  }
}
