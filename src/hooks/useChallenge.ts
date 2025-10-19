'use client'

import { useState, useCallback, useMemo } from 'react'
import { ChallengeService } from '@/lib/services/challenge.service'
import { 
  ChallengeWithUsers, 
  CreateChallengeRequest
} from '@/types/challenge.types'

interface UseChallengeOptions {
  userId: string
  onChallengeAccepted?: (gameSessionId: string) => void
  onError?: (error: string) => void
}

export function useChallenge({ 
  userId, 
  onChallengeAccepted, 
  onError 
}: UseChallengeOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentChallenges, setSentChallenges] = useState<ChallengeWithUsers[]>([])
  const [receivedChallenges, setReceivedChallenges] = useState<ChallengeWithUsers[]>([])
  
  const challengeService = useMemo(() => new ChallengeService(), [])

  /**
   * Send a challenge to another user
   */
  const sendChallenge = useCallback(async (
    challengedId: string, 
    message?: string
  ): Promise<boolean> => {
    if (!userId) return false

    setLoading(true)
    setError(null)

    try {
      const request: CreateChallengeRequest = {
        challenged_id: challengedId,
        message
      }

      const response = await challengeService.createChallenge(userId, request)
      
      if (response.success && response.challenge) {
        // Refresh challenges list
        await refreshChallenges()
        return true
      } else {
        const errorMessage = response.error || 'Failed to send challenge'
        setError(errorMessage)
        onError?.(errorMessage)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [userId, challengeService])

  /**
   * Accept a challenge
   */
  const acceptChallenge = useCallback(async (challengeId: string): Promise<boolean> => {
    console.log('🎯 useChallenge.acceptChallenge called:', { challengeId, userId })
    if (!userId) return false

    setLoading(true)
    setError(null)

    try {
      const response = await challengeService.acceptChallenge(challengeId, userId)
      
      console.log('📨 Challenge service response:', response)
      
      if (response.success) {
        // Refresh challenges list
        await refreshChallenges()
        
        // Navigate to game if game session was created
        if (response.game_session_id) {
          console.log('🎮 Navigating to game session:', response.game_session_id)
          onChallengeAccepted?.(response.game_session_id)
        } else {
          console.warn('⚠️ No game session ID in successful response')
        }
        
        return true
      } else {
        const errorMessage = response.error || 'Failed to accept challenge'
        console.error('❌ Challenge acceptance failed:', errorMessage)
        setError(errorMessage)
        onError?.(errorMessage)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      console.error('❌ Exception in acceptChallenge:', err)
      setError(errorMessage)
      onError?.(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [userId, challengeService, onChallengeAccepted, onError])

  /**
   * Decline a challenge
   */
  const declineChallenge = useCallback(async (challengeId: string): Promise<boolean> => {
    if (!userId) return false

    setLoading(true)
    setError(null)

    try {
      const response = await challengeService.declineChallenge(challengeId, userId)
      
      if (response.success) {
        // Refresh challenges list
        await refreshChallenges()
        return true
      } else {
        const errorMessage = response.error || 'Failed to decline challenge'
        setError(errorMessage)
        onError?.(errorMessage)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [userId, challengeService])

  /**
   * Cancel a challenge
   */
  const cancelChallenge = useCallback(async (challengeId: string): Promise<boolean> => {
    if (!userId) return false

    setLoading(true)
    setError(null)

    try {
      const response = await challengeService.cancelChallenge(challengeId, userId)
      
      if (response.success) {
        // Refresh challenges list
        await refreshChallenges()
        return true
      } else {
        const errorMessage = response.error || 'Failed to cancel challenge'
        setError(errorMessage)
        onError?.(errorMessage)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [userId, challengeService])

  /**
   * Refresh challenges list
   */
  const refreshChallenges = useCallback(async (): Promise<void> => {
    if (!userId) return

    try {
      const challenges = await challengeService.getUserChallenges(userId)
      setSentChallenges(challenges.sent)
      setReceivedChallenges(challenges.received)
    } catch (err) {
      console.error('Error refreshing challenges:', err)
    }
  }, [userId, challengeService])

  /**
   * Check if user can challenge another user
   */
  const canChallengeUser = useCallback(async (challengedId: string): Promise<boolean> => {
    if (!userId) return false

    try {
      return await challengeService.canUserChallenge(userId, challengedId)
    } catch (err) {
      console.error('Error checking if can challenge user:', err)
      return false
    }
  }, [userId, challengeService])

  /**
   * Get challenge status between two users
   */
  const getChallengeStatus = useCallback(async (otherUserId: string) => {
    if (!userId) return { canChallenge: false, hasPendingChallenge: false }

    try {
      return await challengeService.getChallengeStatus(userId, otherUserId)
    } catch (err) {
      console.error('Error getting challenge status:', err)
      return { canChallenge: false, hasPendingChallenge: false }
    }
  }, [userId, challengeService])

  /**
   * Get pending challenges count
   */
  const getPendingCount = useCallback((): number => {
    return receivedChallenges.filter(challenge => challenge.status === 'pending').length
  }, [receivedChallenges])

  return {
    // State
    loading,
    error,
    sentChallenges,
    receivedChallenges,
    pendingCount: getPendingCount(),
    
    // Actions
    sendChallenge,
    acceptChallenge,
    declineChallenge,
    cancelChallenge,
    refreshChallenges,
    canChallengeUser,
    getChallengeStatus,
    
    // Utilities
    clearError: () => setError(null)
  }
}
