'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChallengeNotificationBadge } from '@/components/lobby/ChallengeNotificationBadge'
import { ChallengesModal } from '@/components/lobby/ChallengesModal'
import { ChallengeToast } from '@/components/lobby/ChallengeToast'
import { useChallenge } from '@/hooks/useChallenge'
import { useChallengeNotifications } from '@/hooks/useChallengeNotifications'
import { Player } from '@/types/game.types'
import { ChallengeNotification } from '@/types/challenge.types'

interface ClientHeaderProps {
  user: Player
}

export function ClientHeader({ user }: ClientHeaderProps) {
  const [showChallengesModal, setShowChallengesModal] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: string; notification: ChallengeNotification }>>([])
  const router = useRouter()

  const {
    sentChallenges,
    receivedChallenges,
    loading: challengesLoading,
    sendChallenge,
    acceptChallenge,
    declineChallenge,
    cancelChallenge,
    refreshChallenges
  } = useChallenge({
    userId: user.id,
    onChallengeAccepted: (gameSessionId) => {
      router.push(`/game/${gameSessionId}`)
    },
    onError: (error) => {
      console.error('Challenge error:', error)
    }
  })

  const {
    pendingChallenges,
    notifications,
    unreadCount,
    markAsRead,
    removeNotification
  } = useChallengeNotifications({
    userId: user.id,
    onNewChallenge: (challenge) => {
      // Add toast for new challenge
      const toast = {
        id: `toast-${challenge.id}`,
        notification: {
          id: challenge.id,
          type: 'challenge_received' as const,
          challenger_id: challenge.challenger_id,
          challenged_id: challenge.challenged_id,
          challenger_username: challenge.challenger.username,
          challenger_display_name: challenge.challenger.display_name,
          message: challenge.message,
          created_at: challenge.created_at,
          expires_at: challenge.expires_at
        }
      }
      setToasts(prev => [...prev, toast])
    },
    onChallengeAccepted: (challenge) => {
      // Add toast for accepted challenge
      const toast = {
        id: `toast-accepted-${challenge.id}`,
        notification: {
          id: challenge.id,
          type: 'challenge_accepted' as const,
          challenger_id: challenge.challenger_id,
          challenged_id: challenge.challenged_id,
          challenger_username: challenge.challenger.username,
          challenger_display_name: challenge.challenger.display_name,
          message: challenge.message,
          created_at: challenge.created_at,
          expires_at: challenge.expires_at
        }
      }
      setToasts(prev => [...prev, toast])
    },
    onChallengeDeclined: (challenge) => {
      // Add toast for declined challenge
      const toast = {
        id: `toast-declined-${challenge.id}`,
        notification: {
          id: challenge.id,
          type: 'challenge_declined' as const,
          challenger_id: challenge.challenger_id,
          challenged_id: challenge.challenged_id,
          challenger_username: challenge.challenger.username,
          challenger_display_name: challenge.challenger.display_name,
          message: challenge.message,
          created_at: challenge.created_at,
          expires_at: challenge.expires_at
        }
      }
      setToasts(prev => [...prev, toast])
    },
    onChallengeExpired: (challenge) => {
      // Add toast for expired challenge
      const toast = {
        id: `toast-expired-${challenge.id}`,
        notification: {
          id: challenge.id,
          type: 'challenge_expired' as const,
          challenger_id: challenge.challenger_id,
          challenged_id: challenge.challenged_id,
          challenger_username: challenge.challenger.username,
          challenger_display_name: challenge.challenger.display_name,
          message: challenge.message,
          created_at: challenge.created_at,
          expires_at: challenge.expires_at
        }
      }
      setToasts(prev => [...prev, toast])
    }
  })

  const handleToastAccept = async (challengeId: string) => {
    return await acceptChallenge(challengeId)
  }

  const handleToastDecline = async (challengeId: string) => {
    return await declineChallenge(challengeId)
  }

  const handleToastDismiss = (toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId))
  }

  const handleChallengesModalOpen = () => {
    setShowChallengesModal(true)
    markAsRead()
    refreshChallenges()
  }

  return (
    <>
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
              {/* Challenge Notification Badge */}
              <ChallengeNotificationBadge
                unreadCount={unreadCount}
                onClick={handleChallengesModalOpen}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-[var(--mindduel-accent)] hover:ring-offset-2 hover:ring-offset-[var(--mindduel-surface)] transition-all">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl || ''} alt={user.displayName} />
                      <AvatarFallback className="bg-cyan-400 text-white font-semibold">
                        {user.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-slate-800 border-slate-700" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-semibold text-slate-100">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {user.username}
                      </p>
                      <div className="text-xs text-cyan-400 font-medium">
                        ELO: {user.eloRating}
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
            </div>
          </div>
        </div>
      </header>

      {/* Challenges Modal */}
      <ChallengesModal
        open={showChallengesModal}
        onOpenChange={setShowChallengesModal}
        sentChallenges={sentChallenges}
        receivedChallenges={receivedChallenges}
        loading={challengesLoading}
        onAcceptChallenge={acceptChallenge}
        onDeclineChallenge={declineChallenge}
        onCancelChallenge={cancelChallenge}
      />

      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <ChallengeToast
            key={toast.id}
            notification={toast.notification}
            onAccept={handleToastAccept}
            onDecline={handleToastDecline}
            onDismiss={handleToastDismiss}
          />
        ))}
      </div>
    </>
  )
}
