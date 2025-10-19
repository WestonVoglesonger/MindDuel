import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ClientHeader } from './ClientHeader'
import { UserService } from '@/lib/services/user.service'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in, use ClientHeader for challenge functionality
  if (user) {
    const userService = new UserService()
    const userData = await userService.getUserById(user.id)
    
    if (userData) {
      return <ClientHeader user={userData} />
    }
  }

  // Fallback to basic header for non-authenticated users
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-800/95 backdrop-blur supports-[backdrop-filter]:bg-slate-800/60">
      <div className="container flex h-16 items-center">
        <div className="mr-8 flex">
          <Link href="/" className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-slate-100">
              MindDuel
            </span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-6">
          <nav className="flex items-center space-x-6">
            <Link href="/lobby" className="text-slate-100 hover:text-cyan-400 transition-colors font-medium">
              Play
            </Link>
            <Link href="/leaderboard" className="text-slate-100 hover:text-cyan-400 transition-colors font-medium">
              Leaderboard
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <button className="btn-ghost">
                Sign In
              </button>
            </Link>
            <Link href="/register">
              <button className="btn-primary">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
