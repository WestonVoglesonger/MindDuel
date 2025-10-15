'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MatchmakingQueue } from '@/components/lobby/MatchmakingQueue'
import { PlayerCard } from '@/components/lobby/PlayerCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserService } from '@/lib/services/user.service'
import { User } from '@/types/game.types'
import { Search, Users, Trophy, Settings, LogOut } from 'lucide-react'

export default function LobbyPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [onlinePlayers, setOnlinePlayers] = useState<User[]>([])
  
  const router = useRouter()
  const supabase = createClient()
  const userService = new UserService()

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
        setOnlinePlayers(players)
      } catch (err) {
        console.error('Error loading online players:', err)
      }
    }

    loadOnlinePlayers()
  }, [userService])

  const handleMatchFound = (opponentId: string) => {
    // Navigate to game page
    router.push(`/game/${opponentId}`)
  }

  const handleError = (error: Error) => {
    setError(error.message)
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
                Welcome back, {user.display_name || user.username}!
              </h1>
              <p className="text-gray-600 mt-2">
                Ready for your next trivia challenge?
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Trophy className="h-4 w-4 mr-2" />
                ELO: {user.elo_rating}
              </Badge>
              
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="matchmaking" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="matchmaking" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Find Match</span>
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Players</span>
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
              eloRating={user.elo_rating}
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
                      onChallenge={(playerId) => {
                        // TODO: Implement direct challenge
                        console.log('Challenge player:', playerId)
                      }}
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
                    {user.elo_rating}
                  </div>
                  <div className="text-sm text-muted-foreground">ELO Rating</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {user.games_played}
                  </div>
                  <div className="text-sm text-muted-foreground">Games Played</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {user.games_won}
                  </div>
                  <div className="text-sm text-muted-foreground">Games Won</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {user.games_played > 0 ? Math.round((user.games_won / user.games_played) * 100) : 0}%
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
        </Tabs>
      </div>
    </div>
  )
}
