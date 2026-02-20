import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

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
        <body className={`${poppins.className} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

export { RootLayout as default }
