'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GameSession, GameResult, Question } from '@/types/game.types'
import { GameService } from '@/lib/services/game.service'

interface LocalGameState {
  currentQuestion: Question | null
  selectedPosition: number | null
  buzzerEnabled: boolean
  buzzerWinner: string | null
  answerSubmitted: boolean
  timeRemaining: number
  gamePhase: 'waiting' | 'question' | 'question_reveal' | 'answering' | 'buzzer' | 'buzzer_active' | 'scoring' | 'completed'
}

interface UseRealtimeGameOptions {
  gameSessionId: string
  userId: string
  onGameUpdate?: (gameSession: GameSession) => void
  onGameComplete?: (result: GameResult) => void
  onError?: (error: Error) => void
}

export function useRealtimeGame({
  gameSessionId,
  userId,
  onGameUpdate,
  onGameComplete,
  onError
}: UseRealtimeGameOptions) {
  const [gameSession, setGameSession] = useState<GameSession | null>(null)
  const [gameState, setGameState] = useState<LocalGameState>({
    currentQuestion: null,
    selectedPosition: null,
    buzzerEnabled: false,
    buzzerWinner: null,
    answerSubmitted: false,
    timeRemaining: 0,
    gamePhase: 'waiting'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = useMemo(() => createClient(), [])
  const gameService = useMemo(() => new GameService(), [])

  // Load initial game session
  useEffect(() => {
    async function loadGameSession() {
      try {
        const session = await gameService.getGameSession(gameSessionId)
        if (session) {
          setGameSession(session)
          onGameUpdate?.(session)
        } else {
          setError('Game session not found')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load game session'
        setError(errorMessage)
        onError?.(new Error(errorMessage))
      } finally {
        setLoading(false)
      }
    }

    loadGameSession()
  }, [gameSessionId, gameService])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!gameSessionId) return

    // Subscribe to game session changes
    const gameSubscription = supabase
      .channel(`game-session-${gameSessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${gameSessionId}`
        },
        async (payload) => {
          console.log('Game session update:', payload)
          
          try {
            const updatedSession = await gameService.getGameSession(gameSessionId)
            if (updatedSession) {
              setGameSession(updatedSession)
              onGameUpdate?.(updatedSession)
              
              // Check if game is completed
              if (updatedSession.status === 'completed') {
                const result = await gameService.completeGame(gameSessionId)
                if (result) {
                  onGameComplete?.(result)
                }
              }
            }
          } catch (err) {
            console.error('Error handling game session update:', err)
            onError?.(err instanceof Error ? err : new Error('Unknown error'))
          }
        }
      )
      .subscribe()

    // Subscribe to buzzer events
    const buzzerSubscription = supabase
      .channel(`buzzer-events-${gameSessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'buzzer_events',
          filter: `game_session_id=eq.${gameSessionId}`
        },
        async (payload) => {
          console.log('Buzzer event:', payload)
          
          try {
            // Determine buzzer winner
            const winnerId = await gameService.handleBuzzerPress(
              gameSessionId,
              payload.new.question_id,
              payload.new.player_id
            )
            
            if (winnerId) {
              setGameState(prev => ({
                ...prev,
                buzzerEnabled: false,
                buzzerWinner: winnerId.player_id,
                gamePhase: 'answering'
              }))
            }
          } catch (err) {
            console.error('Error handling buzzer event:', err)
            onError?.(err instanceof Error ? err : new Error('Unknown error'))
          }
        }
      )
      .subscribe()

    // Subscribe to game questions updates
    const questionsSubscription = supabase
      .channel(`game-questions-${gameSessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_questions',
          filter: `game_session_id=eq.${gameSessionId}`
        },
        async (payload) => {
          console.log('Game question update:', payload)
          
          // Update game state based on question status
          if (payload.new.answered_by) {
            setGameState(prev => ({
              ...prev,
              answerSubmitted: true,
              gamePhase: 'scoring'
            }))
          }
        }
      )
      .subscribe()

    return () => {
      gameSubscription.unsubscribe()
      buzzerSubscription.unsubscribe()
      questionsSubscription.unsubscribe()
    }
  }, [gameSessionId, gameService])

  // Handle buzzer press
  const handleBuzzerPress = useCallback(async (questionId: string) => {
    if (!gameState.buzzerEnabled || gameState.buzzerWinner) {
      return false
    }

    try {
      const buzzerEvent = await gameService.handleBuzzerPress(gameSessionId, questionId, userId)
      return !!buzzerEvent
    } catch (err) {
      console.error('Error pressing buzzer:', err)
      onError?.(err instanceof Error ? err : new Error('Unknown error'))
      return false
    }
  }, [gameSessionId, userId, gameState.buzzerEnabled, gameState.buzzerWinner, onError])

  // Handle answer submission
  const handleAnswerSubmission = useCallback(async (questionId: string, answer: string) => {
    try {
      const result = await gameService.submitAnswer(gameSessionId, questionId, userId, answer)
      
      if (result.gameSession) {
        setGameSession(result.gameSession)
        onGameUpdate?.(result.gameSession)
      }
      
      return result
    } catch (err) {
      console.error('Error submitting answer:', err)
      onError?.(err instanceof Error ? err : new Error('Unknown error'))
      return { isCorrect: false, scoreChange: 0, gameSession: null }
    }
  }, [gameSessionId, userId, onGameUpdate, onError])

  // Handle question selection
  const handleQuestionSelection = useCallback(async (questionId: string) => {
    try {
      const updatedSession = await gameService.selectQuestion(gameSessionId, questionId, userId)
      
      if (updatedSession) {
        setGameSession(updatedSession)
        onGameUpdate?.(updatedSession)
        
        // Start buzzer delay timer
        setGameState(prev => ({
          ...prev,
          gamePhase: 'question_reveal',
          buzzerEnabled: false
        }))
        
        // Enable buzzer after random delay
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            buzzerEnabled: true,
            gamePhase: 'buzzer_active'
          }))
        }, Math.random() * 2000 + 1000) // 1-3 seconds
      }
    } catch (err) {
      console.error('Error selecting question:', err)
      onError?.(err instanceof Error ? err : new Error('Unknown error'))
    }
  }, [gameSessionId, userId, onGameUpdate, onError])

  // Reset game state for next question
  const resetGameState = useCallback(() => {
    setGameState({
      currentQuestion: null,
      selectedPosition: null,
      buzzerEnabled: false,
      buzzerWinner: null,
      answerSubmitted: false,
      timeRemaining: 0,
      gamePhase: 'waiting'
    })
  }, [])

  return {
    gameSession,
    gameState,
    loading,
    error,
    handleBuzzerPress,
    handleAnswerSubmission,
    handleQuestionSelection,
    resetGameState,
    isMyTurn: gameSession?.current_turn_player_id === userId,
    isPlayer1: gameSession?.player1_id === userId,
    isPlayer2: gameSession?.player2_id === userId
  }
}
