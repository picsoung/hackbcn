import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { mediaAssets } from '@/db/schema'
import { getCurrentIdentity } from '@/lib/auth/identity-server'
import { getIdentityConfig } from '@/lib/auth/identity-config'
import { ProjectAccessError, projectReference } from '@/lib/projects/ownership'
import {
  mediaStore,
  mediaUrl,
  reserveMedia,
  discardMedia,
} from '@/lib/media/store'
import { assetPattern } from '@/lib/media/shared'
import {
  ImageUploadError,
  normalizeImage,
  readImageBody,
} from '@/lib/media/images'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function POST(request: Request) {
  const headers = {
    'Cache-Control': 'private, no-store',
    Vary: 'Cookie, Origin',
  }
  try {
    const config = getIdentityConfig()
    if (
      !config ||
      request.headers.get('origin') !== new URL(config.redirectUri).origin
    )
      throw new ProjectAccessError('forbidden', 403)
    const user = await getCurrentIdentity()
    if (!user)
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401, headers },
      )
    const query = new URL(request.url).searchParams,
      purpose = query.get('purpose')
    if (!['avatar', 'project'].includes(purpose ?? ''))
      throw new ProjectAccessError('invalid', 422)
    const project =
      purpose === 'project'
        ? (projectReference(query.get('project'))?.key ?? null)
        : null
    const asset = await reserveMedia(
      user,
      purpose as 'avatar' | 'project',
      project,
    )
    const bytes = await readImageBody(request)
    const output = await normalizeImage(bytes, purpose as 'avatar' | 'project')
    await mediaStore().set(`${asset.id}.webp`, new Uint8Array(output))
    await getDb()
      .update(mediaAssets)
      .set({ ready: true })
      .where(eq(mediaAssets.id, asset.id))
    return NextResponse.json({ url: mediaUrl(asset.id) }, { headers })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof ProjectAccessError ||
          error instanceof ImageUploadError
            ? error.code
            : 'unavailable',
      },
      {
        status:
          error instanceof ProjectAccessError ||
          error instanceof ImageUploadError
            ? error.status
            : 503,
        headers,
      },
    )
  }
}

export async function DELETE(request: Request) {
  const headers = {
    'Cache-Control': 'private, no-store',
    Vary: 'Cookie, Origin',
  }
  try {
    const config = getIdentityConfig()
    if (
      !config ||
      request.headers.get('origin') !== new URL(config.redirectUri).origin
    )
      throw new ProjectAccessError('forbidden', 403)
    const user = await getCurrentIdentity()
    if (!user)
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401, headers },
      )
    const id = new URL(request.url).searchParams.get('asset') ?? ''
    if (!assetPattern.test(id)) throw new ProjectAccessError('invalid', 422)
    await discardMedia(user, id)
    return new Response(null, { status: 204, headers })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof ProjectAccessError ? error.code : 'unavailable',
      },
      {
        status: error instanceof ProjectAccessError ? error.status : 503,
        headers,
      },
    )
  }
}
