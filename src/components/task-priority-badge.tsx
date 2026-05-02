import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TaskPriority } from '@/lib/task-api'

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'border-slate-300 bg-slate-100 text-slate-700',
  medium: 'border-amber-300 bg-amber-100 text-amber-800',
  high: 'border-rose-300 bg-rose-100 text-rose-800',
}

export function TaskPriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority
  className?: string
}) {
  return (
    <Badge
      className={cn('border font-medium', PRIORITY_STYLES[priority], className)}
      variant="outline"
    >
      {PRIORITY_LABELS[priority]}
    </Badge>
  )
}
