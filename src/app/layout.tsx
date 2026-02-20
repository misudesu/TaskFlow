import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'TaskFlow — Kanban Board',
  description: 'A modern Kanban-style task planner',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#10B981',
          colorBackground: '#1A1A2E',
          colorText: '#F1F5F9',
          colorInputBackground: 'rgba(255, 255, 255, 0.05)',
          colorInputText: '#F1F5F9',
          borderRadius: '0.75rem',
        },
      }}
    >
      <html lang="en">
        <body className="font-[Poppins] antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

export { RootLayout as default }
