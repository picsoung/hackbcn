import 'server-only'
import { inArray } from 'drizzle-orm'
import { getDb } from '@/db'
import { builderProfiles } from '@/db/schema'

export async function builderDisplayOverrides(slugs: string[]) {
  return slugs.length
    ? getDb()
        .select({
          slug: builderProfiles.slug,
          content: builderProfiles.content,
        })
        .from(builderProfiles)
        .where(inArray(builderProfiles.slug, slugs))
    : []
}
