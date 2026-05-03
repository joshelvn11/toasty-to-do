import { and, asc, desc, eq, isNull } from 'drizzle-orm'
import { db } from '../db/client.js'
import {
  focusSessions,
  focusSessionTasks,
  taskLists,
  tasks,
} from '../db/schema/index.js'
import type {
  FocusSessionRow,
  FocusSessionTaskRow,
} from './focus-session-mappers.js'

type NewFocusSessionRow = {
  id: string
  userId: string
  durationMinutes: number | null
}

type FocusSessionUpdateValues = {
  endedAt?: Date | null
  updatedAt: Date
}

type NewFocusSessionTaskRow = {
  focusSessionId: string
  taskId: string
}

export function insertFocusSession(values: NewFocusSessionRow): FocusSessionRow {
  const [session] = db.insert(focusSessions).values(values).returning().all()

  return session
}

export function findActiveFocusSessionByUserId(
  userId: string,
): FocusSessionRow | undefined {
  return db
    .select()
    .from(focusSessions)
    .where(and(eq(focusSessions.userId, userId), isNull(focusSessions.endedAt)))
    .orderBy(desc(focusSessions.startedAt), desc(focusSessions.id))
    .get()
}

export function findFocusSessionById(
  userId: string,
  sessionId: string,
): FocusSessionRow | undefined {
  return db
    .select()
    .from(focusSessions)
    .where(
      and(
        eq(focusSessions.userId, userId),
        eq(focusSessions.id, sessionId),
      ),
    )
    .get()
}

export function listFocusSessionTasks(sessionId: string): FocusSessionTaskRow[] {
  return db
    .select({
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
      addedToSessionAt: focusSessionTasks.createdAt,
    })
    .from(focusSessionTasks)
    .innerJoin(tasks, eq(focusSessionTasks.taskId, tasks.id))
    .leftJoin(taskLists, eq(tasks.listId, taskLists.id))
    .where(eq(focusSessionTasks.focusSessionId, sessionId))
    .orderBy(asc(focusSessionTasks.createdAt), asc(tasks.id))
    .all()
}

export function findFocusSessionTask(
  sessionId: string,
  taskId: string,
): { focusSessionId: string; taskId: string } | undefined {
  return db
    .select({
      focusSessionId: focusSessionTasks.focusSessionId,
      taskId: focusSessionTasks.taskId,
    })
    .from(focusSessionTasks)
    .where(
      and(
        eq(focusSessionTasks.focusSessionId, sessionId),
        eq(focusSessionTasks.taskId, taskId),
      ),
    )
    .get()
}

export function insertFocusSessionTask(values: NewFocusSessionTaskRow) {
  db.insert(focusSessionTasks).values(values).run()
}

export function deleteFocusSessionTask(sessionId: string, taskId: string) {
  return db
    .delete(focusSessionTasks)
    .where(
      and(
        eq(focusSessionTasks.focusSessionId, sessionId),
        eq(focusSessionTasks.taskId, taskId),
      ),
    )
    .run()
}

export function updateFocusSessionById(
  userId: string,
  sessionId: string,
  values: FocusSessionUpdateValues,
): FocusSessionRow {
  const [session] = db
    .update(focusSessions)
    .set(values)
    .where(
      and(
        eq(focusSessions.userId, userId),
        eq(focusSessions.id, sessionId),
      ),
    )
    .returning()
    .all()

  return session
}
