import { CheckSquare } from 'lucide-react'

interface LogoProps {
  collapsed?: boolean
}

const Logo = ({ collapsed }: LogoProps) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20">
        <CheckSquare size={20} className="text-emerald-400" />
      </div>
      {!collapsed && (
        <span className="text-lg font-bold text-slate-100 whitespace-nowrap">TaskFlow</span>
      )}
    </div>
  )
}

export { Logo }
