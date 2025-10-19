'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MatchmakingQueue } from '@/components/lobby/MatchmakingQueue'
import { PlayerCard } from '@/components/lobby/PlayerCard'
import { SendChallengeDialog } from '@/components/lobby/SendChallengeDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { UserService } from '@/lib/services/user.service'
import { useChallenge } from '@/hooks/useChallenge'
import { useChallengeAcceptance } from '@/hooks/useChallengeAcceptance'
import { useChallengeNotifications } from '@/hooks/useChallengeNotifications'
import { Player as User } from '@/types/game.types'
import { Search, Users, Trophy, LogOut } from 'lucide-react'

export default function LobbyPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [onlinePlayers, setOnlinePlayers] = useState<User[]>([])
  const [showChallengeDialog, setShowChallengeDialog] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<string>('matchmaking')
  
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const userService = useMemo(() => new UserService(), [])

  const {
    sendChallenge,
    acceptChallenge,
    declineChallenge,
    loading: challengeLoading,
    error: challengeError
  } = useChallenge({
    userId: user?.id || '',
    onChallengeAccepted: (gameSessionId) => {
      router.push(`/game/${gameSessionId}`)
    },
    onError: (error) => {
      setError(error)
    }
  })

  // Listen for when challenges sent by this user are accepted
  useChallengeAcceptance({
    userId: user?.id || null,
    onChallengeAccepted: (gameSessionId) => {
      console.log('🎉 Challenge sent by this user was accepted, navigating to game:', gameSessionId)
      // Show toast notification
      toast({
        title: "Challenge Accepted! 🎉",
        description: "Your challenge was accepted! Joining the game...",
        duration: 3000,
      })
      router.push(`/game/${gameSessionId}`)
    }
  })

  // Listen for realtime challenge notifications
  const { pendingChallenges, notifications, unreadCount } = useChallengeNotifications({
    userId: user?.id || '',
    onNewChallenge: (challenge) => {
      toast({
        title: "New Challenge! 🎯",
        description: `${challenge.challenger.display_name} challenged you to a game!`,
        duration: 5000,
      })
    },
    onChallengeAccepted: (challenge) => {
      toast({
        title: "Challenge Accepted! ✅",
        description: `${challenge.challenged.display_name} accepted your challenge!`,
        duration: 3000,
      })
    },
    onChallengeDeclined: (challenge) => {
      toast({
        title: "Challenge Declined 😔",
        description: `${challenge.challenged.display_name} declined your challenge.`,
        duration: 3000,
      })
    },
    onChallengeExpired: (challenge) => {
      toast({
        title: "Challenge Expired ⏰",
        description: `Your challenge to ${challenge.challenged.display_name} has expired.`,
        duration: 3000,
      })
    },
    onError: (error) => {
      console.error('Challenge notification error:', error)
      toast({
        title: "Challenge Error",
        description: error,
        variant: "destructive",
        duration: 3000,
      })
    }
  })

  // Handler functions for challenge actions
  const handleAcceptChallenge = async (challengeId: string) => {
    if (!user?.id) return
    const success = await acceptChallenge(challengeId)
    if (success) {
      console.log('Challenge accepted successfully')
    }
  }

  const handleDeclineChallenge = async (challengeId: string) => {
    if (!user?.id) return
    const success = await declineChallenge(challengeId)
    if (success) {
      console.log('Challenge declined successfully')
    }
  }

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          router.push('/login')
          return
        }

        const userData = await userService.getUserById(authUser.id)
        if (userData) {
          // User data is already transformed to Player interface by userService
          setUser(userData)
        } else {
          setError('User profile not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router, supabase.auth, userService])

  useEffect(() => {
    // Load online players (top 10 by ELO)
    async function loadOnlinePlayers() {
      try {
        const players = await userService.getLeaderboard(10)
        // Players are already transformed to Player interface by userService
        setOnlinePlayers(players)
      } catch (err) {
        console.error('Error loading online players:', err)
      }
    }

    loadOnlinePlayers()
  }, [userService])

  const handleMatchFound = (gameSessionId: string) => {
    // Navigate to game page
    router.push(`/game/${gameSessionId}`)
  }

  const handleError = (error: Error) => {
    setError(error.message)
  }

  const handleChallenge = (playerId: string) => {
    const player = onlinePlayers.find(p => p.id === playerId)
    if (player) {
      setSelectedPlayer(player)
      setShowChallengeDialog(true)
    }
  }

  const handleSendChallenge = async (playerId: string, message?: string) => {
    return await sendChallenge(playerId, message)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading lobby...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error || 'User not found'}</p>
            <Button onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.displayName || user.username}!
              </h1>
              <p className="text-gray-600 mt-2">
                Ready for your next trivia challenge?
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Trophy className="h-4 w-4 mr-2" />
                ELO: {user.eloRating}
              </Badge>

              {/* Challenge Notifications Badge */}
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-lg px-4 py-2 cursor-pointer" onClick={() => setActiveTab?.('challenges')}>
                  🎯 {unreadCount} new challenge{unreadCount !== 1 ? 's' : ''}
                </Badge>
              )}

              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="matchmaking" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Find Match</span>
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Players</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center space-x-2">
              <span>🎯</span>
              <span>Challenges</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Stats</span>
            </TabsTrigger>
          </TabsList>

          {/* Matchmaking Tab */}
          <TabsContent value="matchmaking" className="space-y-6">
            <MatchmakingQueue
              userId={user.id}
              eloRating={user.eloRating}
              onMatchFound={handleMatchFound}
              onError={handleError}
            />
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Top Players</span>
                </CardTitle>
                <CardDescription>
                  Challenge the best players or find someone at your skill level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {onlinePlayers.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      isCurrentPlayer={player.id === user.id}
                      showChallengeButton={player.id !== user.id}
                      onChallenge={handleChallenge}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {user.eloRating}
                  </div>
                  <div className="text-sm text-muted-foreground">ELO Rating</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {user.gamesPlayed}
                  </div>
                  <div className="text-sm text-muted-foreground">Games Played</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {user.gamesWon}
                  </div>
                  <div className="text-sm text-muted-foreground">Games Won</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent games and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent games yet. Start playing to see your activity!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Challenges (Challenges Received) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>📥</span>
                    <span>Challenges Received</span>
                  </CardTitle>
                  <CardDescription>
                    Challenges sent to you by other players
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingChallenges.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <span className="text-4xl">🎯</span>
                      <p className="mt-2">No pending challenges</p>
                      <p className="text-sm">Challenges from other players will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingChallenges.map((challenge) => (
                        <Card key={challenge.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  {challenge.challenger.display_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold">{challenge.challenger.display_name}</p>
                                  <p className="text-sm text-muted-foreground">ELO: {challenge.challenger.elo_rating}</p>
                                  {challenge.message && (
                                    <p className="text-sm text-muted-foreground italic">&ldquo;{challenge.message}&rdquo;</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptChallenge(challenge.id)}
                                  disabled={challengeLoading}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeclineChallenge(challenge.id)}
                                  disabled={challengeLoading}
                                >
                                  Decline
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3 text-xs text-muted-foreground">
                              Expires: {new Date(challenge.expires_at).toLocaleTimeString()}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sent Challenges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>📤</span>
                    <span>Challenges Sent</span>
                  </CardTitle>
                  <CardDescription>
                    Challenges you&apos;ve sent to other players
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    <span className="text-4xl">🚀</span>
                    <p className="mt-2">Challenges you&apos;ve sent will appear here</p>
                    <p className="text-sm">Track the status of your outgoing challenges</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Notifications */}
            {notifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>🔔</span>
                    <span>Recent Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notifications.slice(0, 5).map((notification) => (
                      <div key={notification.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {notification.type === 'challenge_received' && '🎯'}
                            {notification.type === 'challenge_accepted' && '✅'}
                            {notification.type === 'challenge_declined' && '❌'}
                            {notification.type === 'challenge_expired' && '⏰'}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {notification.type === 'challenge_received' && `New challenge from ${notification.challenger_display_name}`}
                              {notification.type === 'challenge_accepted' && `${notification.challenger_display_name} accepted your challenge`}
                              {notification.type === 'challenge_declined' && `${notification.challenger_display_name} declined your challenge`}
                              {notification.type === 'challenge_expired' && `Challenge to ${notification.challenger_display_name} expired`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Send Challenge Dialog */}
      {selectedPlayer && (
        <SendChallengeDialog
          open={showChallengeDialog}
          onOpenChange={setShowChallengeDialog}
          player={selectedPlayer}
          onSendChallenge={handleSendChallenge}
          loading={challengeLoading}
          error={challengeError}
        />
      )}
    </div>
  )
}
