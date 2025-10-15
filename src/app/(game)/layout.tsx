import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
