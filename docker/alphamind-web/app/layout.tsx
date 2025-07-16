import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AlphaMind - AI Agent Management',
  description: 'Advanced AI agent management and automation platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

