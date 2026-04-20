import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { env } from '../config/env.js'

fs.mkdirSync(path.dirname(env.databasePath), { recursive: true })

export const sqlite = new Database(env.databasePath)

sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite)
