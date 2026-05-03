import { and, asc, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { taskLists } from '../db/schema/index.js'
import type { TaskListRow } from './task-list-mappers.js'

type NewTaskListRow = {
  id: string
  userId: string
  name: string
}

type TaskListUpdateValues = {
  name: string
  updatedAt: Date
}

export function insertTaskList(values: NewTaskListRow): TaskListRow {
  const [list] = db.insert(taskLists).values(values).returning().all()

  return list
}

export function listTaskListsByUserId(userId: string): TaskListRow[] {
  return db
    .select()
    .from(taskLists)
    .where(eq(taskLists.userId, userId))
    .orderBy(asc(taskLists.createdAt), asc(taskLists.id))
    .all()
}

export function findTaskListById(
  userId: string,
  listId: string,
): TaskListRow | undefined {
  return db
    .select()
    .from(taskLists)
    .where(and(eq(taskLists.userId, userId), eq(taskLists.id, listId)))
    .get()
}

export function updateTaskListById(
  userId: string,
  listId: string,
  values: TaskListUpdateValues,
): TaskListRow {
  const [list] = db
    .update(taskLists)
    .set(values)
    .where(and(eq(taskLists.userId, userId), eq(taskLists.id, listId)))
    .returning()
    .all()

  return list
}

export function deleteTaskListById(userId: string, listId: string) {
  return db
    .delete(taskLists)
    .where(and(eq(taskLists.userId, userId), eq(taskLists.id, listId)))
    .run()
}
