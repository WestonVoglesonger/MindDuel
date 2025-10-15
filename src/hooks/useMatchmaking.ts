'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MatchmakingService } from '@/lib/services/matchmaking.service'
import { MatchmakingStatus } from '@/types/game.types'

interface UseMatchmakingOptions {
  userId: string
  eloRating: number
  onMatchFound?: (opponentId: string) => void
  onError?: (error: Error) => void
}

export function useMatchmaking({
  userId,
  eloRating,
  onMatchFound,
  onError
}: UseMatchmakingOptions) {
  const [status, setStatus] = useState<MatchmakingStatus>({
    status: 'idle',
    eloRange: 0,
    timeElapsed: 0,
    estimatedWaitTime: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  const matchmakingService = new MatchmakingService()

  // Start matchmaking
  const startMatchmaking = useCallback(async () => {
    if (loading) return false

    setLoading(true)
    setError(null)
    setStatus({
      status: 'searching',
      eloRange: 100,
      timeElapsed: 0,
      estimatedWaitTime: 30
    })

    try {
      const success = await matchmakingService.startMatchmaking(userId, eloRating)
      
      if (success) {
        // Set up real-time subscription for matchmaking updates
        const subscription = supabase
          .channel(`matchmaking-${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'matchmaking_queue',
              filter: `user_id=eq.${userId}`
            },
            async (payload) => {
              console.log('Matchmaking update:', payload)
              
              if (payload.eventType === 'DELETE') {
                // User removed from queue, check if match was found
                const activeGame = await supabase
                  .from('game_sessions')
                  .select('*')
                  .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
                  .eq('status', 'waiting')
                  .single()
                
                if (activeGame.data) {
                  const opponentId = activeGame.data.player1_id === userId 
                    ? activeGame.data.player2_id 
                    : activeGame.data.player1_id
                  
                  setStatus(prev => ({ ...prev, status: 'found' }))
                  onMatchFound?.(opponentId)
                } else {
                  setStatus(prev => ({ ...prev, status: 'idle' }))
                }
              }
            }
          )
          .subscribe()

        // Update status periodically
        const statusInterval = setInterval(async () => {
          try {
            const currentStatus = await matchmakingService.getMatchmakingStatus(userId)
            setStatus(prev => ({
              ...prev,
              ...currentStatus,
              timeElapsed: prev.timeElapsed + 1
            }))
          } catch (err) {
            console.error('Error updating matchmaking status:', err)
          }
        }, 1000)

        // Cleanup function
        return () => {
          subscription.unsubscribe()
          clearInterval(statusInterval)
        }
      } else {
        setError('Failed to start matchmaking')
        setStatus(prev => ({ ...prev, status: 'error' }))
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setStatus(prev => ({ ...prev, status: 'error' }))
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      return false
    } finally {
      setLoading(false)
    }
  }, [userId, eloRating, loading, onMatchFound, onError])

  // Cancel matchmaking
  const cancelMatchmaking = useCallback(async () => {
    if (loading) return false

    setLoading(true)
    setError(null)

    try {
      const success = await matchmakingService.cancelMatchmaking(userId)
      
      if (success) {
        setStatus({
          status: 'idle',
          eloRange: 0,
          timeElapsed: 0,
          estimatedWaitTime: 0
        })
        return true
      } else {
        setError('Failed to cancel matchmaking')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      return false
    } finally {
      setLoading(false)
    }
  }, [userId, loading, onError])

  // Get queue statistics
  const getQueueStats = useCallback(async () => {
    try {
      return await matchmakingService.getQueueStats()
    } catch (err) {
      console.error('Error getting queue stats:', err)
      return { totalInQueue: 0, averageElo: 1200, averageWaitTime: 30 }
    }
  }, [])

  // Check if user is in queue
  const isInQueue = useCallback(async () => {
    try {
      return await matchmakingService.isUserInQueue(userId)
    } catch (err) {
      console.error('Error checking queue status:', err)
      return false
    }
  }, [userId])

  // Get estimated wait time
  const getEstimatedWaitTime = useCallback(async () => {
    try {
      return await matchmakingService.getEstimatedWaitTime(eloRating)
    } catch (err) {
      console.error('Error getting estimated wait time:', err)
      return 30
    }
  }, [eloRating])

  // Initialize status on mount
  useEffect(() => {
    async function initializeStatus() {
      try {
        const inQueue = await isInQueue()
        if (inQueue) {
          const currentStatus = await matchmakingService.getMatchmakingStatus(userId)
          setStatus(currentStatus)
        }
      } catch (err) {
        console.error('Error initializing matchmaking status:', err)
      }
    }

    initializeStatus()
  }, [userId, isInQueue])

  return {
    status,
    loading,
    error,
    startMatchmaking,
    cancelMatchmaking,
    getQueueStats,
    isInQueue,
    getEstimatedWaitTime,
    isSearching: status.status === 'searching',
    isIdle: status.status === 'idle',
    isFound: status.status === 'found',
    hasError: status.status === 'error'
  }
}
