import 'server-only'
import { getConnectionString, getDatabase } from '@netlify/database'
import { drizzle } from 'drizzle-orm/netlify-db'
import * as schema from './schema'

function createDatabase() {
  return drizzle({ client: getDatabase(), schema })
}

let database: ReturnType<typeof createDatabase> | undefined
let databaseConnection: string | undefined

// Resolve Netlify's branch-specific credentials inside a request, never at build time.
export function getDb() {
  const connectionString = getConnectionString()
  if (!database || databaseConnection !== connectionString) {
    database = createDatabase()
    databaseConnection = connectionString
  }
  return database
}
