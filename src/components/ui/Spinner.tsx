import { Loader2 } from 'lucide-react'

const Spinner = ({ size = 16 }: { size?: number }) => (
  <Loader2 size={size} className="animate-spin text-emerald-400" />
)

export { Spinner }
