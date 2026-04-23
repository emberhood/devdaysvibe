import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DrupalWatch',
  description: 'Monitor Drupal.org issue queues and get AI-powered summaries',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  )
}
