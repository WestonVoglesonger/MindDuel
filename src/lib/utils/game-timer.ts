/**
 * Timer class for managing game timers
 */
class GameTimer {
  private intervalId: NodeJS.Timeout | null = null
  private timeoutId: NodeJS.Timeout | null = null
  private onTick: (timeRemaining: number) => void
  private onComplete: () => void
  private duration: number
  private remaining: number

  constructor(
    duration: number,
    onTick: (timeRemaining: number) => void,
    onComplete: () => void
  ) {
    this.duration = duration
    this.remaining = duration
    this.onTick = onTick
    this.onComplete = onComplete
  }

  start() {
    this.stop()
    this.remaining = this.duration
    
    this.intervalId = setInterval(() => {
      this.remaining -= 100
      this.onTick(this.remaining)
      
      if (this.remaining <= 0) {
        this.stop()
        this.onComplete()
      }
    }, 100)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  getRemaining(): number {
    return this.remaining
  }
}

/**
 * Creates a buzzer delay timer
 */
export function createBuzzerDelayTimer(onActivate: () => void) {
  const delay = Math.random() * 2000 + 1000 // 1-3 seconds
  
  return {
    start: () => {
      setTimeout(onActivate, delay)
    },
    stop: () => {
      // Timer will complete naturally
    }
  }
}

/**
 * Creates an answer timer
 */
export function createAnswerTimer(
  onTick: (timeRemaining: number) => void,
  onComplete: () => void
) {
  return new GameTimer(5000, onTick, onComplete)
}