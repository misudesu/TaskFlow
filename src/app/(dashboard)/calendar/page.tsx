import { TopBar } from '@/components/layout/TopBar'

const CalendarPage = () => {
  return (
    <>
      <TopBar title="Calendar" />
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Calendar</h1>
          <p className="text-sm text-slate-400 mt-1">View tasks by date</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center text-slate-500">
          Calendar view coming soon
        </div>
      </div>
    </>
  )
}

export { CalendarPage as default }
