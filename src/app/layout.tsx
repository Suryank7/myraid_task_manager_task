import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/components/providers/query-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TaskForge',
  description: 'A secure, real-time productivity command center',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen`}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster theme="dark" position="bottom-right" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
