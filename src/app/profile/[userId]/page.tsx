import { createClient } from '@/lib/supabase/server'
import { UserService } from '@/lib/services/user.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Trophy, Target, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface ProfilePageProps {
  params: Promise<{
    userId: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const userService = new UserService()

  const user = await userService.getUserById(userId)
  const stats = await userService.getUserGameStats(userId)
  const matchHistory = await userService.getUserMatchHistory(userId, 10)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">User not found</p>
            <Link href="/lobby">
              <Button className="mt-4">Back to Lobby</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getEloTier = (rating: number) => {
    if (rating < 1000) return { tier: 'Novice', color: 'bg-gray-500' }
    if (rating < 1200) return { tier: 'Bronze', color: 'bg-orange-600' }
    if (rating < 1400) return { tier: 'Silver', color: 'bg-gray-400' }
    if (rating < 1600) return { tier: 'Gold', color: 'bg-yellow-500' }
    if (rating < 1800) return { tier: 'Platinum', color: 'bg-blue-500' }
    if (rating < 2000) return { tier: 'Diamond', color: 'bg-purple-500' }
    return { tier: 'Master', color: 'bg-red-500' }
  }

  const eloTier = getEloTier(user.eloRating)
  const isOwnProfile = authUser?.id === user.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/lobby">
            <Button variant="outline" className="mb-4">
              ← Back to Lobby
            </Button>
          </Link>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatarUrl || ''} alt={user.displayName || user.username} />
                <AvatarFallback className="text-2xl">
                  {(user.displayName || user.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {user.displayName || user.username}
                </h1>
                <p className="text-gray-600 mb-4">@{user.username}</p>
                
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className={`text-lg px-4 py-2 ${eloTier.color} text-white`}>
                    <Trophy className="h-4 w-4 mr-2" />
                    {eloTier.tier}
                  </Badge>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    ELO: {user.eloRating}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {user.gamesPlayed}
              </div>
              <div className="text-sm text-muted-foreground">Games Played</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {user.gamesWon}
              </div>
              <div className="text-sm text-muted-foreground">Games Won</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {user.eloRating}
              </div>
              <div className="text-sm text-muted-foreground">ELO Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Match History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Games</span>
            </CardTitle>
            <CardDescription>
              Your last 10 games and their outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matchHistory.length > 0 ? (
              <div className="space-y-4">
                {matchHistory.map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        match.winner?.id === user.id ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium">
                          vs {match.player1.id === user.id ? match.player2?.displayName : match.player1?.displayName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {match.completed_at ? new Date(match.completed_at).toLocaleDateString() : 'In Progress'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {/* Scores not implemented yet */}
                        0 - 0
                      </p>
                      <p className={`text-sm ${
                        match.winner?.id === user.id ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {match.winner?.id === user.id ? 'Won' : 'Lost'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No games played yet. Start playing to see your match history!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
