import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-[var(--mindduel-accent)] hover:ring-offset-2 hover:ring-offset-[var(--mindduel-surface)] transition-all">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                      <AvatarFallback className="bg-cyan-400 text-white font-semibold">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-slate-800 border-slate-700" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-semibold text-slate-100">
                        {user.user_metadata?.display_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-slate-400">
                        {user.email}
                      </p>
                      <div className="text-xs text-cyan-400 font-medium">
                        ELO: 1200
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[var(--mindduel-border)]" />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.id}`} className="text-slate-100 hover:bg-slate-900">
                      <span className="mr-2">👤</span>
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="text-slate-100 hover:bg-slate-900">
                      <span className="mr-2">⚙️</span>
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[var(--mindduel-border)]" />
                  <DropdownMenuItem asChild>
                    <form action="/auth/logout" method="post">
                      <button type="submit" className="flex w-full items-center text-slate-100 hover:bg-slate-900">
                        <span className="mr-2">🚪</span>
                        <span>Log out</span>
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
