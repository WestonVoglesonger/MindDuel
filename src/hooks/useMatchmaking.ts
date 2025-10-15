'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { MatchmakingService } from '@/lib/services/matchmaking.service'

interface MatchmakingStatus {
  status: 'idle' | 'searching' | 'found' | 'matched' | 'error'
  eloRange: number
  timeElapsed: number
  estimatedWaitTime: number
}

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
  
  const supabase = useMemo(() => createClient(), [])
  const matchmakingService = useMemo(() => new MatchmakingService(), [])
  const subscriptionRef = useRef<RealtimeChannel | null>(null)
  const queueActiveRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const clearRealtime = useCallback(() => {
    if (subscriptionRef.current) {
      void subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
    }

    queueActiveRef.current = false

    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    startTimeRef.current = null
  }, [])

  const startLocalTimer = useCallback((elapsedSeconds: number) => {
    if (!queueActiveRef.current) {
      return
    }

    startTimeRef.current = Date.now() - elapsedSeconds * 1000

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      if (startTimeRef.current === null) {
        return
      }

      const elapsed = Math.max(
        0,
        Math.floor((Date.now() - startTimeRef.current) / 1000)
      )

      setStatus((prev) =>
        prev.timeElapsed === elapsed ? prev : { ...prev, timeElapsed: elapsed }
      )
    }, 1000)
  }, [])

  const subscribeToQueueChanges = useCallback(() => {
    if (subscriptionRef.current) {
      void subscriptionRef.current.unsubscribe()
    }

    const channel = supabase
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
            const activeGame = await supabase
              .from('game_sessions')
              .select('*')
              .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
              .in('status', ['waiting', 'in_progress'])
              .maybeSingle()

            clearRealtime()

            if (activeGame.data) {
              setStatus(prev => ({ ...prev, status: 'found' }))
              onMatchFound?.(activeGame.data.id)
            } else {
              setStatus({
                status: 'idle',
                eloRange: 0,
                timeElapsed: 0,
                estimatedWaitTime: 0
              })
            }
          }
        }
      )
      .subscribe()

    queueActiveRef.current = true
    subscriptionRef.current = channel
  }, [supabase, userId, clearRealtime, onMatchFound])

  const beginStatusPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }

    pollingRef.current = setInterval(async () => {
      if (!subscriptionRef.current) {
        return
      }

      if (!queueActiveRef.current) {
        return
      }

      try {
        const currentStatus = await matchmakingService.getMatchmakingStatus(userId)
        startLocalTimer(currentStatus.timeElapsed)
        setStatus(prev => ({
          ...prev,
          ...currentStatus
        }))
      } catch (err) {
        console.error('Error updating matchmaking status:', err)
      }
    }, 3000)
  }, [matchmakingService, startLocalTimer, userId])

  // Start matchmaking
  const startMatchmaking = useCallback(async () => {
    if (loading) return false

    setLoading(true)
    setError(null)
    clearRealtime()
    setStatus({
      status: 'searching',
      eloRange: 100,
      timeElapsed: 0,
      estimatedWaitTime: 30
    })

    try {
      const success = await matchmakingService.startMatchmaking(userId, eloRating)

      if (!success) {
        setError('Failed to start matchmaking')
        setStatus(prev => ({ ...prev, status: 'error' }))
        return false
      }

      subscribeToQueueChanges()
      startLocalTimer(0)

      try {
        const currentStatus = await matchmakingService.getMatchmakingStatus(userId)
        if (queueActiveRef.current) {
          startLocalTimer(currentStatus.timeElapsed)
          setStatus(prev => ({
            ...prev,
            ...currentStatus
          }))
        }
      } catch (statusError) {
        console.error('Error fetching initial matchmaking status:', statusError)
      }

      beginStatusPolling()

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setStatus(prev => ({ ...prev, status: 'error' }))
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      clearRealtime()
      return false
    } finally {
      setLoading(false)
    }
  }, [
    loading,
    matchmakingService,
    userId,
    eloRating,
    subscribeToQueueChanges,
    startLocalTimer,
    beginStatusPolling,
    onError,
    clearRealtime
  ])

  const startTestMatch = useCallback(async () => {
    if (loading) return null

    setLoading(true)
    setError(null)
    clearRealtime()

    try {
      const sessionId = await matchmakingService.startTestMatch(userId)

      setStatus({
        status: 'found',
        eloRange: 0,
        timeElapsed: 0,
        estimatedWaitTime: 0,
      })

      onMatchFound?.(sessionId)
      return sessionId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      return null
    } finally {
      setLoading(false)
    }
  }, [
    loading,
    matchmakingService,
    userId,
    onMatchFound,
    onError,
    clearRealtime,
  ])

  // Cancel matchmaking
  const cancelMatchmaking = useCallback(async () => {
    if (loading) return false

    setLoading(true)
    setError(null)

    try {
      const success = await matchmakingService.cancelMatchmaking(userId)

      if (success) {
        clearRealtime()
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
  }, [loading, matchmakingService, userId, onError, clearRealtime])

  // Get queue statistics
  const getQueueStats = useCallback(async () => {
    try {
      return await matchmakingService.getQueueStats()
    } catch (err) {
      console.error('Error getting queue stats:', err)
      return { totalInQueue: 0, averageElo: 1200, averageWaitTime: 30 }
    }
  }, [matchmakingService])

  // Check if user is in queue
  const isInQueue = useCallback(async () => {
    try {
      return await matchmakingService.isUserInQueue(userId)
    } catch (err) {
      console.error('Error checking queue status:', err)
      return false
    }
  }, [matchmakingService, userId])

  // Get estimated wait time
  const getEstimatedWaitTime = useCallback(async () => {
    try {
      return await matchmakingService.getEstimatedWaitTime(eloRating)
    } catch (err) {
      console.error('Error getting estimated wait time:', err)
      return 30
    }
  }, [eloRating, matchmakingService])

  // Initialize status on mount
  useEffect(() => {
    async function initializeStatus() {
      try {
        const inQueue = await isInQueue()
        if (!inQueue) {
          return
        }

        clearRealtime()
        subscribeToQueueChanges()
        const currentStatus = await matchmakingService.getMatchmakingStatus(userId)
        if (queueActiveRef.current) {
          setStatus(currentStatus)
          startLocalTimer(currentStatus.timeElapsed)
          beginStatusPolling()
        }
      } catch (err) {
        console.error('Error initializing matchmaking status:', err)
      }
    }

    initializeStatus()
  }, [
    userId,
    isInQueue,
    matchmakingService,
    startLocalTimer,
    subscribeToQueueChanges,
    beginStatusPolling,
    clearRealtime
  ])

  useEffect(() => {
    return () => {
      clearRealtime()
    }
  }, [clearRealtime])

  return {
    status,
    loading,
    error,
    startMatchmaking,
    startTestMatch,
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
