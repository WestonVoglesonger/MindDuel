'use client'

import { useState, useCallback, useRef } from 'react'
import { createBuzzerDelayTimer, createAnswerTimer } from '@/lib/utils/game-timer'

interface UseBuzzerOptions {
  onBuzzerActivate?: () => void
  onBuzzerPress?: () => void
  onAnswerTimeout?: () => void
  onAnswerTick?: (timeRemaining: number) => void
}

export function useBuzzer({
  onBuzzerActivate,
  onBuzzerPress,
  onAnswerTimeout,
  onAnswerTick
}: UseBuzzerOptions = {}) {
  const [buzzerEnabled, setBuzzerEnabled] = useState(false)
  const [buzzerPressed, setBuzzerPressed] = useState(false)
  const [answerTimeRemaining, setAnswerTimeRemaining] = useState(0)
  const [isAnswering, setIsAnswering] = useState(false)
  
  const buzzerTimerRef = useRef<any>(null)
  const answerTimerRef = useRef<any>(null)

  // Enable buzzer with random delay
  const enableBuzzer = useCallback(() => {
    if (buzzerTimerRef.current) {
      buzzerTimerRef.current.stop()
    }

    setBuzzerEnabled(false)
    setBuzzerPressed(false)

    buzzerTimerRef.current = createBuzzerDelayTimer(() => {
      setBuzzerEnabled(true)
      onBuzzerActivate?.()
    })

    buzzerTimerRef.current.start()
  }, [onBuzzerActivate])

  // Disable buzzer
  const disableBuzzer = useCallback(() => {
    if (buzzerTimerRef.current) {
      buzzerTimerRef.current.stop()
      buzzerTimerRef.current = null
    }
    
    setBuzzerEnabled(false)
    setBuzzerPressed(false)
  }, [])

  // Handle buzzer press
  const pressBuzzer = useCallback(() => {
    if (!buzzerEnabled || buzzerPressed) {
      return false
    }

    setBuzzerPressed(true)
    setBuzzerEnabled(false)
    onBuzzerPress?.()
    
    return true
  }, [buzzerEnabled, buzzerPressed, onBuzzerPress])

  // Start answer timer
  const startAnswerTimer = useCallback(() => {
    if (answerTimerRef.current) {
      answerTimerRef.current.stop()
    }

    setIsAnswering(true)
    setAnswerTimeRemaining(5000) // 5 seconds

    answerTimerRef.current = createAnswerTimer(
      (timeRemaining) => {
        setAnswerTimeRemaining(timeRemaining)
        onAnswerTick?.(timeRemaining)
      },
      () => {
        setIsAnswering(false)
        setAnswerTimeRemaining(0)
        onAnswerTimeout?.()
      }
    )

    answerTimerRef.current.start()
  }, [onAnswerTick, onAnswerTimeout])

  // Stop answer timer
  const stopAnswerTimer = useCallback(() => {
    if (answerTimerRef.current) {
      answerTimerRef.current.stop()
      answerTimerRef.current = null
    }
    
    setIsAnswering(false)
    setAnswerTimeRemaining(0)
  }, [])

  // Reset buzzer state
  const resetBuzzer = useCallback(() => {
    disableBuzzer()
    stopAnswerTimer()
    setBuzzerPressed(false)
    setIsAnswering(false)
    setAnswerTimeRemaining(0)
  }, [disableBuzzer, stopAnswerTimer])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (buzzerTimerRef.current) {
      buzzerTimerRef.current.stop()
    }
    if (answerTimerRef.current) {
      answerTimerRef.current.stop()
    }
  }, [])

  return {
    buzzerEnabled,
    buzzerPressed,
    answerTimeRemaining,
    isAnswering,
    enableBuzzer,
    disableBuzzer,
    pressBuzzer,
    startAnswerTimer,
    stopAnswerTimer,
    resetBuzzer,
    cleanup
  }
}
