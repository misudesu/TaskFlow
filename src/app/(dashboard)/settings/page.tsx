import { TopBar } from '@/components/layout/TopBar'

const SettingsPage = () => {
  return (
    <>
      <TopBar title="Settings" />
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your preferences</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center text-slate-500">
          Settings coming soon
        </div>
      </div>
    </>
  )
}

export { SettingsPage as default }
