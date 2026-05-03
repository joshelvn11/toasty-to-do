import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from './client.js'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

export function applyPendingMigrations() {
  migrate(db, {
    migrationsFolder: path.resolve(currentDir, '../../drizzle'),
  })
}
