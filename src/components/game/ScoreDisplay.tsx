'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
    <div className="w-full max-w-6xl mx-auto mb-8">
      {/* Main Score Display - Horizontal Layout */}
      <div className="score-display">
        <div className="flex items-center justify-between">
          {/* Player 1 */}
          <div className={`flex items-center space-x-4 flex-1 ${currentTurnPlayerId === player1.id ? 'player-active' : ''}`}>
            <Avatar className="h-14 w-14">
              <AvatarImage src={player1.avatarUrl || ''} alt={player1.username} />
              <AvatarFallback className="bg-slate-800 text-slate-100 text-lg font-semibold">
                {player1.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-slate-100">
                  {player1.displayName}
                </h3>
                {currentTurnPlayerId === player1.id && (
                  <div className="px-2 py-1 bg-cyan-400 text-white text-xs font-medium rounded">
                    TURN
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm text-slate-400">
                  {player1Tier.tier}
                </span>
                <span className="text-sm text-slate-400">
                  ELO: {player1.eloRating}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-score text-slate-100">
                ${player1.score.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Center Divider */}
          <div className="mx-8 h-16 w-px bg-slate-700"></div>

          {/* Game Status */}
          <div className="text-center min-w-[200px]">
            <div className="text-lg font-semibold text-slate-100 mb-1">
              MindDuel
            </div>
            <div className="text-sm text-slate-400 mb-2">
              {questionsRemaining} questions remaining
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              {gamePhase.replace('_', ' ')}
            </div>
          </div>

          {/* Center Divider */}
          <div className="mx-8 h-16 w-px bg-slate-700"></div>

          {/* Player 2 */}
          <div className={`flex items-center space-x-4 flex-1 ${currentTurnPlayerId === player2.id ? 'player-active' : ''}`}>
            <div className="text-left">
              <div className="text-score text-slate-100">
                ${player2.score.toLocaleString()}
              </div>
            </div>
            
            <div className="flex-1 text-right">
              <div className="flex items-center justify-end space-x-3">
                {currentTurnPlayerId === player2.id && (
                  <div className="px-2 py-1 bg-cyan-400 text-white text-xs font-medium rounded">
                    TURN
                  </div>
                )}
                <h3 className="text-xl font-semibold text-slate-100">
                  {player2.displayName}
                </h3>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-1">
                <span className="text-sm text-slate-400">
                  ELO: {player2.eloRating}
                </span>
                <span className="text-sm text-slate-400">
                  {player2Tier.tier}
                </span>
              </div>
            </div>
            
            <Avatar className="h-14 w-14">
              <AvatarImage src={player2.avatarUrl || ''} alt={player2.username} />
              <AvatarFallback className="bg-slate-800 text-slate-100 text-lg font-semibold">
                {player2.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Score Comparison */}
      <div className="mt-4 text-center">
        <div className="text-sm text-slate-400">
          {player1.score > player2.score 
            ? `${player1.displayName} leads by $${(player1.score - player2.score).toLocaleString()}`
            : player2.score > player1.score
              ? `${player2.displayName} leads by $${(player2.score - player1.score).toLocaleString()}`
              : 'Tied game!'
          }
        </div>
      </div>
    </div>
  )
}
