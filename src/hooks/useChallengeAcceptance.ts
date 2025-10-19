'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ChallengeAcceptancePayload {
  challengeId: string
  gameSessionId: string
  challengedUserId: string
  message: string
}

interface UseChallengeAcceptanceProps {
  userId: string | null
  onChallengeAccepted?: (gameSessionId: string) => void
}

export function useChallengeAcceptance({ 
  userId, 
  onChallengeAccepted 
}: UseChallengeAcceptanceProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!userId) return

    console.log('📡 Setting up challenge acceptance listener for user:', userId)

    // Subscribe to challenge acceptance notifications
    const channel = supabase
      .channel(`challenge-accepted-${userId}`)
      .on('broadcast', { event: 'challenge_accepted' }, (payload) => {
        console.log('🎉 Challenge acceptance notification received:', payload)
        
        // Navigate to the game session
        const gameSessionId = payload.payload.gameSessionId
        console.log('🎮 Navigating challenger to game session:', gameSessionId)
        
        // Use the callback if provided, otherwise navigate directly
        if (onChallengeAccepted) {
          onChallengeAccepted(gameSessionId)
        } else {
          router.push(`/game/${gameSessionId}`)
        }
      })
      .subscribe()

    return () => {
      console.log('📡 Cleaning up challenge acceptance listener')
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, router, onChallengeAccepted])

  return {
    // No return values needed for this hook
  }
}
