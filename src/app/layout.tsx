import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'The Luj Project | Badge Automation Platform',
  description: 'Generate professional ID cards and badges in bulk - The Luj Project',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
