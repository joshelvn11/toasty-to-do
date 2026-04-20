export const FOCUS_SESSION_STATUSES = ['active', 'ended'] as const

export type FocusSessionStatus = (typeof FOCUS_SESSION_STATUSES)[number]

export function getFocusSessionStatus(
  endedAt: Date | null,
): FocusSessionStatus {
  return endedAt ? 'ended' : 'active'
}
