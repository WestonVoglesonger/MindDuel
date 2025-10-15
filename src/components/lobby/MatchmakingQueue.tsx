'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useMatchmaking } from '@/hooks/useMatchmaking'
import { Search, Users, Clock, Zap, Trophy } from 'lucide-react'

interface MatchmakingQueueProps {
  userId: string
  eloRating: number
  onMatchFound: (opponentId: string) => void
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

  const handleCancelMatchmaking = async () => {
    await cancelMatchmaking()
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case 'searching':
        return <Search className="h-5 w-5 animate-spin" />
      case 'found':
        return <Zap className="h-5 w-5 text-green-600" />
      case 'error':
        return <Users className="h-5 w-5 text-red-600" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const getStatusColor = () => {
    switch (status.status) {
      case 'searching':
        return 'text-blue-600'
      case 'found':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Main Matchmaking Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={getStatusColor()}>
              {getStatusMessage()}
            </span>
          </CardTitle>
          <CardDescription>
            Find an opponent with similar skill level for a fair match
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* ELO Display */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ELO: {eloRating}
            </div>
            <Badge variant="secondary" className="mt-2">
              <Trophy className="h-3 w-3 mr-1" />
              {eloRating < 1000 ? 'Novice' : 
               eloRating < 1200 ? 'Bronze' :
               eloRating < 1400 ? 'Silver' :
               eloRating < 1600 ? 'Gold' :
               eloRating < 1800 ? 'Platinum' :
               eloRating < 2000 ? 'Diamond' : 'Master'}
            </Badge>
          </div>

          {/* Search Progress */}
          {isSearching && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Searching...</span>
                <span>{status.timeElapsed}s</span>
              </div>
              <Progress 
                value={(status.timeElapsed / status.estimatedWaitTime) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground text-center">
                Searching within ±{status.eloRange} ELO range
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            {isIdle ? (
              <Button
                onClick={handleStartMatchmaking}
                disabled={loading}
                size="lg"
                className="text-lg px-8 py-6"
              >
                <Search className="mr-2 h-5 w-5" />
                Find Match
              </Button>
            ) : isSearching ? (
              <Button
                onClick={handleCancelMatchmaking}
                disabled={loading}
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6"
              >
                Cancel Search
              </Button>
            ) : isFound ? (
              <Button
                disabled
                size="lg"
                className="text-lg px-8 py-6 bg-green-600"
              >
                <Zap className="mr-2 h-5 w-5" />
                Match Found!
              </Button>
            ) : (
              <Button
                onClick={handleStartMatchmaking}
                disabled={loading}
                size="lg"
                className="text-lg px-8 py-6"
              >
                Try Again
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Queue Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {queueStats.totalInQueue}
              </div>
              <div className="text-sm text-muted-foreground">Players Online</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {queueStats.averageElo}
              </div>
              <div className="text-sm text-muted-foreground">Avg ELO</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {queueStats.averageWaitTime}s
              </div>
              <div className="text-sm text-muted-foreground">Avg Wait</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matchmaking Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How Matchmaking Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">1</span>
            </div>
            <div>
              <p className="text-sm font-medium">ELO-Based Matching</p>
              <p className="text-xs text-muted-foreground">
                We find opponents within ±100 ELO of your rating for fair matches
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-green-600">2</span>
            </div>
            <div>
              <p className="text-sm font-medium">Expanding Search</p>
              <p className="text-xs text-muted-foreground">
                If no match is found, we expand the ELO range every 10 seconds
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-purple-600">3</span>
            </div>
            <div>
              <p className="text-sm font-medium">Quick Games</p>
              <p className="text-xs text-muted-foreground">
                Games last 10-15 minutes with 25 questions in a 5x5 grid
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
