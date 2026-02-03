import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Secret Project: GHOST',
  description: 'High-End WebGL Game',
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
