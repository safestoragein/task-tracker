import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TaskProvider } from '@/contexts/TaskContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Team Task Tracker',
  description: 'Advanced Kanban board for core team task management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TaskProvider>
            {children}
            <Toaster />
          </TaskProvider>
        </AuthProvider>
      </body>
    </html>
  )
}