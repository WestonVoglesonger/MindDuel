'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Target } from 'lucide-react'

interface Player {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  score: number
  eloRating: number
  isCurrentPlayer: boolean
}

interface ScoreDisplayProps {
  player1: Player
  player2: Player
  currentTurnPlayerId: string
  questionsRemaining: number
  gamePhase: string
}

export function ScoreDisplay({
  player1,
  player2,
  currentTurnPlayerId,
  questionsRemaining,
  gamePhase
}: ScoreDisplayProps) {
  const getEloTier = (rating: number) => {
    if (rating < 1000) return { tier: 'Novice', color: 'bg-gray-500' }
    if (rating < 1200) return { tier: 'Bronze', color: 'bg-orange-600' }
    if (rating < 1400) return { tier: 'Silver', color: 'bg-gray-400' }
    if (rating < 1600) return { tier: 'Gold', color: 'bg-yellow-500' }
    if (rating < 1800) return { tier: 'Platinum', color: 'bg-blue-500' }
    if (rating < 2000) return { tier: 'Diamond', color: 'bg-purple-500' }
    return { tier: 'Master', color: 'bg-red-500' }
  }

  const player1Tier = getEloTier(player1.eloRating)
  const player2Tier = getEloTier(player2.eloRating)

  return (
    <div className="w-full max-w-6xl mx-auto mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Player 1 */}
        <Card className={`transition-all duration-200 ${
          currentTurnPlayerId === player1.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={player1.avatarUrl || ''} alt={player1.username} />
                <AvatarFallback>
                  {player1.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-lg truncate">
                    {player1.displayName}
                  </h3>
                  {currentTurnPlayerId === player1.id && (
                    <Badge variant="default" className="text-xs">
                      <Target className="h-3 w-3 mr-1" />
                      Turn
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className={`text-xs ${player1Tier.color} text-white`}>
                    {player1Tier.tier}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ELO: {player1.eloRating}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <div className="text-3xl font-bold text-blue-600">
                ${player1.score.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Status */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-lg">MindDuel</span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {questionsRemaining} questions remaining
              </div>
              
              <Badge variant="outline" className="text-xs">
                {gamePhase.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Player 2 */}
        <Card className={`transition-all duration-200 ${
          currentTurnPlayerId === player2.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={player2.avatarUrl || ''} alt={player2.username} />
                <AvatarFallback>
                  {player2.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-lg truncate">
                    {player2.displayName}
                  </h3>
                  {currentTurnPlayerId === player2.id && (
                    <Badge variant="default" className="text-xs">
                      <Target className="h-3 w-3 mr-1" />
                      Turn
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className={`text-xs ${player2Tier.color} text-white`}>
                    {player2Tier.tier}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ELO: {player2.eloRating}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <div className="text-3xl font-bold text-purple-600">
                ${player2.score.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Comparison */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-4 text-sm text-muted-foreground">
          <span>
            {player1.score > player2.score ? '👑' : player2.score > player1.score ? '👑' : '🤝'}
          </span>
          <span>
            {player1.score > player2.score 
              ? `${player1.displayName} leads by $${(player1.score - player2.score).toLocaleString()}`
              : player2.score > player1.score
                ? `${player2.displayName} leads by $${(player2.score - player1.score).toLocaleString()}`
                : 'Tied game!'
            }
          </span>
        </div>
      </div>
    </div>
  )
}
