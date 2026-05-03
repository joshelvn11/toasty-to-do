import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from './client.js'

export function applyPendingMigrations() {
  migrate(db, {
    migrationsFolder: './drizzle',
  })
}
