import { cn } from '@/lib/utils'
import type { Priority } from '@/types/global'

const priorityStyles: Record<Priority, string> = {
  urgent: 'bg-red-500/15 text-red-400 border border-red-500/20',
  high: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  medium: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  low: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
}

interface BadgeProps {
  priority: Priority
  className?: string
}

const Badge = ({ priority, className }: BadgeProps) => {
  return (
    <span
      className={cn(
        'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
        priorityStyles[priority],
        className
      )}
    >
      {priority}
    </span>
  )
}

export { Badge }
