'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChallengeWithUsers, ChallengeNotification } from '@/types/challenge.types'
import { ChallengeService } from '@/lib/services/challenge.service'

interface UseChallengeNotificationsOptions {
  userId: string
  onNewChallenge?: (challenge: ChallengeWithUsers) => void
  onChallengeAccepted?: (challenge: ChallengeWithUsers) => void
  onChallengeDeclined?: (challenge: ChallengeWithUsers) => void
  onChallengeExpired?: (challenge: ChallengeWithUsers) => void
  onError?: (error: string) => void
}

export function useChallengeNotifications({
  userId,
  onNewChallenge,
  onChallengeAccepted,
  onChallengeDeclined,
  onChallengeExpired,
  onError
}: UseChallengeNotificationsOptions) {
  const [pendingChallenges, setPendingChallenges] = useState<ChallengeWithUsers[]>([])
  const [notifications, setNotifications] = useState<ChallengeNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const challengeService = new ChallengeService()

  /**
   * Load initial pending challenges
   */
  const loadPendingChallenges = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const challenges = await challengeService.getPendingChallenges(userId)
      setPendingChallenges(challenges)
      setUnreadCount(challenges.length)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load challenges'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [userId, challengeService, onError])

  /**
   * Add a notification
   */
  const addNotification = useCallback((notification: ChallengeNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep last 10 notifications
    setUnreadCount(prev => prev + 1)
  }, [])

  /**
   * Mark notifications as read
   */
  const markAsRead = useCallback(() => {
    setUnreadCount(0)
  }, [])

  /**
   * Clear notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  /**
   * Remove a notification
   */
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])

  // Load initial data
  useEffect(() => {
    loadPendingChallenges()
  }, [loadPendingChallenges])

  // Set up realtime subscriptions
  useEffect(() => {
    if (!userId) return

    // Subscribe to challenges table changes
    const challengesSubscription = supabase
      .channel(`challenges-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'challenges',
          filter: `challenged_id=eq.${userId}`
        },
        async (payload) => {
          console.log('New challenge received:', payload)
          
          try {
            // Get the full challenge with user details
            const challenge = await challengeService.getChallenge(payload.new.id)
            if (challenge) {
              setPendingChallenges(prev => [challenge, ...prev])
              setUnreadCount(prev => prev + 1)
              
              // Create notification
              const notification: ChallengeNotification = {
                id: challenge.id,
                type: 'challenge_received',
                challenger_id: challenge.challenger_id,
                challenged_id: challenge.challenged_id,
                challenger_username: challenge.challenger.username,
                challenger_display_name: challenge.challenger.display_name,
                message: challenge.message,
                created_at: challenge.created_at,
                expires_at: challenge.expires_at
              }
              
              addNotification(notification)
              onNewChallenge?.(challenge)
            }
          } catch (err) {
            console.error('Error handling new challenge:', err)
            onError?.(err instanceof Error ? err.message : 'Unknown error')
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'challenges',
          filter: `challenger_id=eq.${userId}`
        },
        async (payload) => {
          console.log('Challenge status updated:', payload)
          
          try {
            const challenge = await challengeService.getChallenge(payload.new.id)
            if (challenge) {
              // Update pending challenges list
              setPendingChallenges(prev => 
                prev.filter(c => c.id !== challenge.id)
              )
              
              // Create notification based on status
              let notificationType: ChallengeNotification['type']
              let callback: ((challenge: ChallengeWithUsers) => void) | undefined
              
              switch (payload.new.status) {
                case 'accepted':
                  notificationType = 'challenge_accepted'
                  callback = onChallengeAccepted
                  break
                case 'declined':
                  notificationType = 'challenge_declined'
                  callback = onChallengeDeclined
                  break
                case 'expired':
                  notificationType = 'challenge_expired'
                  callback = onChallengeExpired
                  break
                default:
                  return
              }
              
              const notification: ChallengeNotification = {
                id: challenge.id,
                type: notificationType,
                challenger_id: challenge.challenger_id,
                challenged_id: challenge.challenged_id,
                challenger_username: challenge.challenger.username,
                challenger_display_name: challenge.challenger.display_name,
                message: challenge.message,
                created_at: challenge.created_at,
                expires_at: challenge.expires_at
              }
              
              addNotification(notification)
              callback?.(challenge)
            }
          } catch (err) {
            console.error('Error handling challenge update:', err)
            onError?.(err instanceof Error ? err.message : 'Unknown error')
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'challenges',
          filter: `challenged_id=eq.${userId}`
        },
        async (payload) => {
          console.log('Received challenge status updated:', payload)
          
          try {
            // Update pending challenges list
            setPendingChallenges(prev => 
              prev.filter(c => c.id !== payload.new.id)
            )
            
            // Update unread count
            if (payload.new.status !== 'pending') {
              setUnreadCount(prev => Math.max(0, prev - 1))
            }
          } catch (err) {
            console.error('Error handling received challenge update:', err)
            onError?.(err instanceof Error ? err.message : 'Unknown error')
          }
        }
      )
      .subscribe()

    return () => {
      challengesSubscription.unsubscribe()
    }
  }, [
    userId, 
    supabase, 
    challengeService, 
    addNotification, 
    onNewChallenge, 
    onChallengeAccepted, 
    onChallengeDeclined, 
    onChallengeExpired, 
    onError
  ])

  return {
    // State
    pendingChallenges,
    notifications,
    unreadCount,
    loading,
    error,
    
    // Actions
    loadPendingChallenges,
    markAsRead,
    clearNotifications,
    removeNotification,
    
    // Utilities
    clearError: () => setError(null)
  }
}
