import { createClient } from '@/lib/supabase/server'
import { UserService } from '@/lib/services/user.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Trophy, Crown, Medal, Target } from 'lucide-react'
import Link from 'next/link'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const userService = new UserService()

  const leaderboard = await userService.getLeaderboard(100)

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
    return 'bg-white'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/lobby">
            <Button variant="outline" className="mb-4">
              ← Back to Lobby
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-2">
              <Trophy className="h-10 w-10 text-yellow-600" />
              <span>Leaderboard</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Top players by ELO rating
            </p>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 2nd Place */}
            <div className="order-2 md:order-1">
              <Card className={`${getRankColor(2)} h-64`}>
                <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                  <div className="mb-4">
                    <Medal className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-2xl font-bold">#2</span>
                  </div>
                  <Avatar className="h-16 w-16 mx-auto mb-4">
                    <AvatarImage src={leaderboard[1].avatar_url || ''} alt={leaderboard[1].display_name || leaderboard[1].username} />
                    <AvatarFallback className="text-xl">
                      {(leaderboard[1].display_name || leaderboard[1].username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold mb-2">
                    {leaderboard[1].display_name || leaderboard[1].username}
                  </h3>
                  <p className="text-lg font-semibold">
                    ELO: {leaderboard[1].elo_rating}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 1st Place */}
            <div className="order-1 md:order-2">
              <Card className={`${getRankColor(1)} h-72`}>
                <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                  <div className="mb-4">
                    <Crown className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                    <span className="text-3xl font-bold">#1</span>
                  </div>
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={leaderboard[0].avatar_url || ''} alt={leaderboard[0].display_name || leaderboard[0].username} />
                    <AvatarFallback className="text-2xl">
                      {(leaderboard[0].display_name || leaderboard[0].username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-2xl font-bold mb-2">
                    {leaderboard[0].display_name || leaderboard[0].username}
                  </h3>
                  <p className="text-xl font-semibold">
                    ELO: {leaderboard[0].elo_rating}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 3rd Place */}
            <div className="order-3">
              <Card className={`${getRankColor(3)} h-64`}>
                <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                  <div className="mb-4">
                    <Medal className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <span className="text-2xl font-bold">#3</span>
                  </div>
                  <Avatar className="h-16 w-16 mx-auto mb-4">
                    <AvatarImage src={leaderboard[2].avatar_url || ''} alt={leaderboard[2].display_name || leaderboard[2].username} />
                    <AvatarFallback className="text-xl">
                      {(leaderboard[2].display_name || leaderboard[2].username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold mb-2">
                    {leaderboard[2].display_name || leaderboard[2].username}
                  </h3>
                  <p className="text-lg font-semibold">
                    ELO: {leaderboard[2].elo_rating}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Top 100 Players</span>
            </CardTitle>
            <CardDescription>
              Rankings based on ELO rating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.map((player, index) => {
                const rank = index + 1
                const eloTier = getEloTier(player.elo_rating)
                const isCurrentUser = authUser?.id === player.id

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      isCurrentUser ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(rank)}
                        {isCurrentUser && (
                          <Badge variant="default" className="text-xs">
                            <Target className="h-3 w-3 mr-1" />
                            You
                          </Badge>
                        )}
                      </div>
                      
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={player.avatar_url || ''} alt={player.display_name || player.username} />
                        <AvatarFallback>
                          {(player.display_name || player.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-semibold">
                          {player.display_name || player.username}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className={`text-xs ${eloTier.color} text-white`}>
                            {eloTier.tier}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {player.games_played} games
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {player.elo_rating}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {player.games_played > 0 ? Math.round((player.games_won / player.games_played) * 100) : 0}% win rate
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
