import { and, desc, eq, isNotNull, isNull } from 'drizzle-orm'
import { db } from '../db/client.js'
import { taskLists, tasks } from '../db/schema/index.js'
import type { TaskWithListRow } from './task-mappers.js'
import type { TaskListStatus, TaskPriority } from './task-types.js'

type NewTaskRow = {
  id: string
  userId: string
  listId: string | null
  title: string
  priority: TaskPriority
}

type TaskUpdateValues = {
  title?: string
  priority?: TaskPriority
  listId?: string | null
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

function getTaskSelection() {
  return {
    id: tasks.id,
    userId: tasks.userId,
    listId: taskLists.id,
    title: tasks.title,
    priority: tasks.priority,
    completedAt: tasks.completedAt,
    createdAt: tasks.createdAt,
    updatedAt: tasks.updatedAt,
    listName: taskLists.name,
    listCreatedAt: taskLists.createdAt,
    listUpdatedAt: taskLists.updatedAt,
  }
}

export function insertTask(values: NewTaskRow): TaskWithListRow {
  const [task] = db.insert(tasks).values(values).returning().all()

  return findTaskById(values.userId, task.id)!
}

export function listTasksByUserId(
  userId: string,
  status: TaskListStatus,
): TaskWithListRow[] {
  return db
    .select(getTaskSelection())
    .from(tasks)
    .leftJoin(taskLists, eq(tasks.listId, taskLists.id))
    .where(getListFilter(userId, status))
    .orderBy(desc(tasks.createdAt), desc(tasks.id))
    .all()
}

export function findTaskById(
  userId: string,
  taskId: string,
): TaskWithListRow | undefined {
  return db
    .select(getTaskSelection())
    .from(tasks)
    .leftJoin(taskLists, eq(tasks.listId, taskLists.id))
    .where(and(eq(tasks.userId, userId), eq(tasks.id, taskId)))
    .get()
}

export function updateTaskById(
  userId: string,
  taskId: string,
  values: TaskUpdateValues,
): TaskWithListRow {
  db
    .update(tasks)
    .set(values)
    .where(and(eq(tasks.userId, userId), eq(tasks.id, taskId)))
    .run()

  return findTaskById(userId, taskId)!
}
