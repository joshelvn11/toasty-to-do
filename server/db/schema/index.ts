import { sql } from 'drizzle-orm'
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'
import { TASK_PRIORITIES } from '../../tasks/task-types.js'

export const users = sqliteTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailVerified: integer('email_verified', {
      mode: 'boolean',
    })
      .notNull()
      .default(false),
    image: text('image'),
    createdAt: integer('created_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    emailUniqueIndex: uniqueIndex('user_email_unique').on(table.email),
  }),
)

export const sessions = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull(),
    expiresAt: integer('expires_at', {
      mode: 'timestamp_ms',
    }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: integer('created_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    tokenUniqueIndex: uniqueIndex('session_token_unique').on(table.token),
    userIdIndex: index('session_user_id_idx').on(table.userId),
  }),
)

export const accounts = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', {
      mode: 'timestamp_ms',
    }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', {
      mode: 'timestamp_ms',
    }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    providerAccountUniqueIndex: uniqueIndex(
      'account_provider_account_unique',
    ).on(table.providerId, table.accountId),
    userIdIndex: index('account_user_id_idx').on(table.userId),
  }),
)

export const verifications = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', {
      mode: 'timestamp_ms',
    }).notNull(),
    createdAt: integer('created_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    identifierIndex: index('verification_identifier_idx').on(table.identifier),
  }),
)

export const tasks = sqliteTable(
  'task',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    priority: text('priority', {
      enum: TASK_PRIORITIES,
    }).notNull(),
    completedAt: integer('completed_at', {
      mode: 'timestamp_ms',
    }),
    createdAt: integer('created_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    priorityCheck: check(
      'task_priority_check',
      sql`${table.priority} in ('low', 'medium', 'high')`,
    ),
    userIdIndex: index('task_user_id_idx').on(table.userId),
    userCompletedIndex: index('task_user_completed_idx').on(
      table.userId,
      table.completedAt,
    ),
    userPriorityIndex: index('task_user_priority_idx').on(
      table.userId,
      table.priority,
    ),
  }),
)

export const focusSessions = sqliteTable(
  'focus_session',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    durationMinutes: integer('duration_minutes'),
    startedAt: integer('started_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    endedAt: integer('ended_at', {
      mode: 'timestamp_ms',
    }),
    createdAt: integer('created_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    userIdIndex: index('focus_session_user_id_idx').on(table.userId),
    userStartedIndex: index('focus_session_user_started_idx').on(
      table.userId,
      table.startedAt,
    ),
  }),
)

export const focusSessionTasks = sqliteTable(
  'focus_session_task',
  {
    focusSessionId: text('focus_session_id')
      .notNull()
      .references(() => focusSessions.id, { onDelete: 'cascade' }),
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    primaryKey: primaryKey({
      columns: [table.focusSessionId, table.taskId],
    }),
    taskIdIndex: index('focus_session_task_task_id_idx').on(table.taskId),
  }),
)

export const authSchema = {
  user: users,
  session: sessions,
  account: accounts,
  verification: verifications,
}

export const appSchema = {
  ...authSchema,
  task: tasks,
  focusSession: focusSessions,
  focusSessionTask: focusSessionTasks,
}
