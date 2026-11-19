import { NextResponse } from 'next/server'
import { getCurrentIdentity } from '@/lib/auth/identity-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }

export async function GET() {
  try {
    return NextResponse.json({ user: await getCurrentIdentity() }, { headers })
  } catch {
    return NextResponse.json(
      { error: 'identity_unavailable' },
      { status: 503, headers },
    )
  }
}
