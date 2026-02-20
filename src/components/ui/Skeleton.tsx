import { cn } from '@/lib/utils'

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse bg-white/5 rounded-xl', className)} />
)

export { Skeleton }
