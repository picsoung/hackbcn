import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  // Netlify applies everything in this folder automatically on deploy.
  out: 'netlify/database/migrations',
})
