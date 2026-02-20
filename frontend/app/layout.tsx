import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import Providers from '@/components/Providers'
import NotificationToast from '@/components/NotificationToast'

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
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <AuthProvider>
            {children}
            <NotificationToast />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
