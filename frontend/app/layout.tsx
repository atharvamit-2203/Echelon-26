import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fair-Hire | AI-Powered Bias Detection',
  description: 'Stop losing top talent to hidden ATS bias. Fair-Hire monitors your hiring process for discrimination and helps you find hidden experts.',
  keywords: 'ATS, bias detection, fair hiring, AI recruitment, diversity hiring',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
