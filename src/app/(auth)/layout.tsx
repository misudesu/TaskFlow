const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F0F0F]">
      {children}
    </div>
  )
}

export { AuthLayout as default }
