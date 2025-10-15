import { GAME_CONFIG } from '@/constants/game-config'

export class GameTimer {
  private timerId: NodeJS.Timeout | null = null
  private startTime: number = 0
  private duration: number = 0
  private onTick: (timeRemaining: number) => void
  private onComplete: () => void

  constructor(
    duration: number,
    onTick: (timeRemaining: number) => void,
    onComplete: () => void
  ) {
    this.duration = duration
    this.onTick = onTick
    this.onComplete = onComplete
  }

  /**
   * Start the timer
   */
  start(): void {
    this.startTime = Date.now()
    this.timerId = setInterval(() => {
      const elapsed = Date.now() - this.startTime
      const remaining = Math.max(0, this.duration - elapsed)
      
      this.onTick(remaining)
      
      if (remaining <= 0) {
        this.stop()
        this.onComplete()
      }
    }, 100) // Update every 100ms for smooth countdown
  }

  /**
   * Stop the timer
   */
  stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  }

  /**
   * Get remaining time in milliseconds
   */
  getRemainingTime(): number {
    if (!this.startTime) return this.duration
    
    const elapsed = Date.now() - this.startTime
    return Math.max(0, this.duration - elapsed)
  }

  /**
   * Get remaining time in seconds
   */
  getRemainingSeconds(): number {
    return Math.ceil(this.getRemainingTime() / 1000)
  }

  /**
   * Check if timer is running
   */
  isRunning(): boolean {
    return this.timerId !== null
  }

  /**
   * Reset timer to full duration
   */
  reset(): void {
    this.stop()
    this.startTime = 0
  }
}

/**
 * Create a buzzer delay timer
 * @param onActivate - Callback when buzzer becomes active
 * @returns Timer instance
 */
export function createBuzzerDelayTimer(onActivate: () => void): GameTimer {
  const delay = Math.random() * (GAME_CONFIG.BUZZER_DELAY_MAX - GAME_CONFIG.BUZZER_DELAY_MIN) + GAME_CONFIG.BUZZER_DELAY_MIN
  
  return new GameTimer(
    delay,
    () => {}, // No tick callback needed for buzzer delay
    onActivate
  )
}

/**
 * Create an answer timer
 * @param onTick - Callback for each tick
 * @param onComplete - Callback when time runs out
 * @returns Timer instance
 */
export function createAnswerTimer(
  onTick: (timeRemaining: number) => void,
  onComplete: () => void
): GameTimer {
  return new GameTimer(
    GAME_CONFIG.ANSWER_TIMEOUT,
    onTick,
    onComplete
  )
}

/**
 * Format time remaining as MM:SS
 * @param milliseconds - Time in milliseconds
 * @returns Formatted time string
 */
export function formatTimeRemaining(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Format time remaining as SS
 * @param milliseconds - Time in milliseconds
 * @returns Formatted time string
 */
export function formatSecondsRemaining(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000)
  return seconds.toString()
}
