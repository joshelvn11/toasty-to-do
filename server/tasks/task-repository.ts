import { and, desc, eq, isNotNull, isNull } from 'drizzle-orm'
import { db } from '../db/client.js'
import { tasks } from '../db/schema/index.js'
import type { TaskRow } from './task-mappers.js'
import type { TaskListStatus, TaskPriority } from './task-types.js'

type NewTaskRow = {
  id: string
  userId: string
  title: string
  priority: TaskPriority
}

type TaskUpdateValues = {
  title?: string
  priority?: TaskPriority
  completedAt?: Date | null
  updatedAt: Date
}

function getListFilter(userId: string, status: TaskListStatus) {
  if (status === 'completed') {
    return and(eq(tasks.userId, userId), isNotNull(tasks.completedAt))
  }

  if (status === 'all') {
    return eq(tasks.userId, userId)
  }

  return and(eq(tasks.userId, userId), isNull(tasks.completedAt))
}

export function insertTask(values: NewTaskRow): TaskRow {
  const [task] = db.insert(tasks).values(values).returning().all()

  return task
}

export function listTasksByUserId(
  userId: string,
  status: TaskListStatus,
): TaskRow[] {
  return db
    .select()
    .from(tasks)
    .where(getListFilter(userId, status))
    .orderBy(desc(tasks.createdAt), desc(tasks.id))
    .all()
}

export function findTaskById(userId: string, taskId: string): TaskRow | undefined {
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.id, taskId)))
    .get()
}

export function updateTaskById(
  userId: string,
  taskId: string,
  values: TaskUpdateValues,
): TaskRow {
  const [task] = db
    .update(tasks)
    .set(values)
    .where(and(eq(tasks.userId, userId), eq(tasks.id, taskId)))
    .returning()
    .all()

  return task
}
