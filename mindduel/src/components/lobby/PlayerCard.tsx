'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Target, Clock } from 'lucide-react'

interface Player {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  eloRating: number
  gamesPlayed: number
  gamesWon: number
  isOnline?: boolean
  lastSeen?: string
}

interface PlayerCardProps {
  player: Player
  isCurrentPlayer?: boolean
  onChallenge?: (playerId: string) => void
  showChallengeButton?: boolean
  className?: string
}

export function PlayerCard({
  player,
  isCurrentPlayer = false,
  onChallenge,
  showChallengeButton = false,
  className = ''
}: PlayerCardProps) {
  const getEloTier = (rating: number) => {
    if (rating < 1000) return { tier: 'Novice', color: 'bg-gray-500' }
    if (rating < 1200) return { tier: 'Bronze', color: 'bg-orange-600' }
    if (rating < 1400) return { tier: 'Silver', color: 'bg-gray-400' }
    if (rating < 1600) return { tier: 'Gold', color: 'bg-yellow-500' }
    if (rating < 1800) return { tier: 'Platinum', color: 'bg-blue-500' }
    if (rating < 2000) return { tier: 'Diamond', color: 'bg-purple-500' }
    return { tier: 'Master', color: 'bg-red-500' }
  }

  const eloTier = getEloTier(player.eloRating)
  const winRate = player.gamesPlayed > 0 ? (player.gamesWon / player.gamesPlayed) * 100 : 0

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${
      isCurrentPlayer ? 'ring-2 ring-blue-500' : ''
    } ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={player.avatarUrl || ''} alt={player.displayName} />
              <AvatarFallback>
                {player.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {player.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg truncate">
                {player.displayName}
              </h3>
              {isCurrentPlayer && (
                <Badge variant="default" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  You
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className={`text-xs ${eloTier.color} text-white`}>
                <Trophy className="h-3 w-3 mr-1" />
                {eloTier.tier}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ELO: {player.eloRating}
              </span>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {player.gamesPlayed}
            </div>
            <div className="text-xs text-muted-foreground">Games</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
        </div>

        {/* Challenge Button */}
        {showChallengeButton && !isCurrentPlayer && onChallenge && (
          <div className="mt-4">
            <Button
              onClick={() => onChallenge(player.id)}
              className="w-full"
              size="sm"
            >
              Challenge
            </Button>
          </div>
        )}

        {/* Last Seen */}
        {player.lastSeen && !player.isOnline && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            <Clock className="h-3 w-3 inline mr-1" />
            Last seen {player.lastSeen}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
