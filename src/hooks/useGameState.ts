'use client'

import { useState, useCallback, useEffect } from 'react'
import { Question } from '@/types/game.types'

interface LocalGameState {
  currentQuestion: Question | null
  selectedPosition: number | null
  buzzerEnabled: boolean
  buzzerWinner: string | null
  answerSubmitted: boolean
  timeRemaining: number
  gamePhase: 'waiting' | 'question' | 'question_reveal' | 'answering' | 'buzzer' | 'buzzer_active' | 'scoring' | 'completed'
}

interface UseGameStateOptions {
  onStateChange?: (newState: LocalGameState) => void
  onQuestionSelect?: (question: Question, position: number) => void
  onAnswerSubmit?: (questionId: string, answer: string) => void
}

export function useGameState({
  onStateChange,
  onQuestionSelect,
  onAnswerSubmit
}: UseGameStateOptions = {}) {
  const [gameState, setGameState] = useState<LocalGameState>({
    currentQuestion: null,
    selectedPosition: null,
    buzzerEnabled: false,
    buzzerWinner: null,
    answerSubmitted: false,
    timeRemaining: 0,
    gamePhase: 'waiting'
  })

  // Update game state
  const updateGameState = useCallback((updates: Partial<LocalGameState>) => {
    setGameState(prev => {
      const newState = { ...prev, ...updates }
      onStateChange?.(newState)
      return newState
    })
  }, [onStateChange])

  // Select a question
  const selectQuestion = useCallback((question: Question, position: number) => {
    updateGameState({
      currentQuestion: question,
      selectedPosition: position,
      gamePhase: 'question_reveal',
      buzzerEnabled: false,
      buzzerWinner: null,
      answerSubmitted: false,
      timeRemaining: 0
    })
    
    onQuestionSelect?.(question, position)
  }, [updateGameState, onQuestionSelect])

  // Enable buzzer
  const enableBuzzer = useCallback(() => {
    updateGameState({
      buzzerEnabled: true,
      gamePhase: 'buzzer_active'
    })
  }, [updateGameState])

  // Handle buzzer press
  const handleBuzzerPress = useCallback((playerId: string) => {
    updateGameState({
      buzzerEnabled: false,
      buzzerWinner: playerId,
      gamePhase: 'answering'
    })
  }, [updateGameState])

  // Submit answer
  const submitAnswer = useCallback((questionId: string, answer: string) => {
    updateGameState({
      answerSubmitted: true,
      gamePhase: 'scoring'
    })
    
    onAnswerSubmit?.(questionId, answer)
  }, [updateGameState, onAnswerSubmit])

  // Reset for next question
  const resetForNextQuestion = useCallback(() => {
    updateGameState({
      currentQuestion: null,
      selectedPosition: null,
      buzzerEnabled: false,
      buzzerWinner: null,
      answerSubmitted: false,
      timeRemaining: 0,
      gamePhase: 'waiting'
    })
  }, [updateGameState])

  // Set game phase
  const setGamePhase = useCallback((phase: LocalGameState['gamePhase']) => {
    updateGameState({ gamePhase: phase })
  }, [updateGameState])

  // Set time remaining
  const setTimeRemaining = useCallback((time: number) => {
    updateGameState({ timeRemaining: time })
  }, [updateGameState])

  // Check if it's a specific game phase
  const isGamePhase = useCallback((phase: LocalGameState['gamePhase']) => {
    return gameState.gamePhase === phase
  }, [gameState.gamePhase])

  // Check if buzzer is active
  const isBuzzerActive = useCallback(() => {
    return gameState.buzzerEnabled && !gameState.buzzerWinner
  }, [gameState.buzzerEnabled, gameState.buzzerWinner])

  // Check if answer has been submitted
  const isAnswerSubmitted = useCallback(() => {
    return gameState.answerSubmitted
  }, [gameState.answerSubmitted])

  // Get current question
  const getCurrentQuestion = useCallback(() => {
    return gameState.currentQuestion
  }, [gameState.currentQuestion])

  // Get buzzer winner
  const getBuzzerWinner = useCallback(() => {
    return gameState.buzzerWinner
  }, [gameState.buzzerWinner])

  // Get time remaining
  const getTimeRemaining = useCallback(() => {
    return gameState.timeRemaining
  }, [gameState.timeRemaining])

  return {
    gameState,
    updateGameState,
    selectQuestion,
    enableBuzzer,
    handleBuzzerPress,
    submitAnswer,
    resetForNextQuestion,
    setGamePhase,
    setTimeRemaining,
    isGamePhase,
    isBuzzerActive,
    isAnswerSubmitted,
    getCurrentQuestion,
    getBuzzerWinner,
    getTimeRemaining
  }
}
