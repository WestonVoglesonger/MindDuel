'use client'

import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { useMatchmaking } from '@/hooks/useMatchmaking'

interface MatchmakingQueueProps {
  userId: string
  eloRating: number
  onMatchFound: (gameSessionId: string) => void
  onError: (error: Error) => void
}

export function MatchmakingQueue({
  userId,
  eloRating,
  onMatchFound,
  onError
}: MatchmakingQueueProps) {
  const {
    status,
    loading,
    error,
    startMatchmaking,
    startTestMatch,
    cancelMatchmaking,
    getQueueStats,
    isSearching,
    isIdle,
    isFound
  } = useMatchmaking({
    userId,
    eloRating,
    onMatchFound,
    onError
  })

  const [queueStats, setQueueStats] = useState({
    totalInQueue: 0,
    averageElo: 1200,
    averageWaitTime: 30
  })

  useEffect(() => {
    const loadStats = async () => {
      const stats = await getQueueStats()
      setQueueStats(stats)
    }
    loadStats()
  }, [getQueueStats])

  const handleStartMatchmaking = async () => {
    await startMatchmaking()
  }

  const handleStartTestMatch = async () => {
    const sessionId = await startTestMatch()
    if (!sessionId) {
      return
    }
    onMatchFound(sessionId)
  }

  const handleCancelMatchmaking = async () => {
    await cancelMatchmaking()
  }

  const getStatusMessage = () => {
    switch (status.status) {
      case 'searching':
        return `Searching for opponent... (${status.timeElapsed}s)`
      case 'found':
        return 'Match found! Starting game...'
      case 'error':
        return 'Error finding match. Please try again.'
      default:
        return 'Ready to find a match'
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Matchmaking Card */}
      <div className="score-display">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-heading mb-2">Find Your Match</h2>
          <p className="text-muted">Find an opponent with similar skill level for a fair match</p>
        </div>

        {/* ELO Display */}
        <div className="text-center mb-6">
          <div className="text-score text-cyan-400 mb-2">
            ELO: {eloRating}
          </div>
          <div className="text-sm text-slate-400">
            {eloRating < 1000 ? 'Novice' : 
             eloRating < 1200 ? 'Bronze' :
             eloRating < 1400 ? 'Silver' :
             eloRating < 1600 ? 'Gold' :
             eloRating < 1800 ? 'Platinum' :
             eloRating < 2000 ? 'Diamond' : 'Master'}
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center mb-6">
          <div className={`text-lg font-semibold ${
            status.status === 'searching' ? 'text-cyan-400' :
            status.status === 'found' ? 'text-emerald-500' :
            status.status === 'error' ? 'text-red-500' :
            'text-slate-100'
          }`}>
            {getStatusMessage()}
          </div>
        </div>

        {/* Search Progress */}
        {isSearching && (
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Searching...</span>
              <span>{status.timeElapsed}s</span>
            </div>
            <Progress 
              value={(status.timeElapsed / status.estimatedWaitTime) * 100} 
              className="h-2"
            />
            <p className="text-xs text-slate-400 text-center">
              Searching within ±{status.eloRange} ELO range
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          {isIdle ? (
            <>
              <button
                onClick={handleStartMatchmaking}
                disabled={loading}
                className="btn-primary text-lg px-8 py-4"
              >
                Find Match
              </button>
              <button
                onClick={handleStartTestMatch}
                disabled={loading}
                className="btn-secondary text-lg px-8 py-4"
              >
                Test Match
              </button>
            </>
          ) : isSearching ? (
            <>
              <button
                onClick={handleCancelMatchmaking}
                disabled={loading}
                className="btn-secondary text-lg px-8 py-4"
              >
                Cancel Search
              </button>
              <button
                onClick={handleStartTestMatch}
                disabled={loading}
                className="btn-ghost text-lg px-8 py-4"
              >
                Switch to Test Match
              </button>
            </>
          ) : isFound ? (
            <button
              disabled
              className="btn-primary text-lg px-8 py-4 bg-emerald-500 hover:bg-emerald-500"
            >
              Match Found!
            </button>
          ) : (
            <>
              <button
                onClick={handleStartMatchmaking}
                disabled={loading}
                className="btn-primary text-lg px-8 py-4"
              >
                Try Again
              </button>
              <button
                onClick={handleStartTestMatch}
                disabled={loading}
                className="btn-secondary text-lg px-8 py-4"
              >
                Test Match
              </button>
            </>
          )}
        </div>

        {/* Queue Statistics - Inline */}
        <div className="flex justify-center space-x-8 text-center border-t border-slate-700 pt-6">
          <div>
            <div className="text-xl font-bold text-cyan-400">
              {queueStats.totalInQueue}
            </div>
            <div className="text-xs text-slate-400">Players Online</div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-500">
              {queueStats.averageElo}
            </div>
            <div className="text-xs text-slate-400">Avg ELO</div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100">
              {queueStats.averageWaitTime}s
            </div>
            <div className="text-xs text-slate-400">Avg Wait</div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
