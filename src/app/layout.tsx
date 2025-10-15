import Header from '@/components/layout/Header'
import './globals.css'

export const metadata = {
  title: 'MindDuel - Real-Time Trivia Game',
  description: 'Compete in head-to-head trivia battles with real-time gameplay and ELO rankings.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  )
}