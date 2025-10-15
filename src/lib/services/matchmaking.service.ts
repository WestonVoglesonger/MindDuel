import { MatchmakingServiceInterface } from '@/lib/interfaces/matchmaking.interface'

interface MatchmakingStatus {
  status: 'idle' | 'searching' | 'found' | 'matched' | 'error'
  eloRange: number
  timeElapsed: number
  estimatedWaitTime: number
}
import * as matchmakingDb from '@/lib/db/matchmaking.db'
import * as gameDb from '@/lib/db/game.db'
import { GAME_CONFIG } from '@/constants/game-config'

export class MatchmakingService implements MatchmakingServiceInterface {
  private static matchmakingIntervals = new Map<string, NodeJS.Timeout>()

  async enterMatchmaking(userId: string, eloRating: number): Promise<boolean> {
    try {
      const result = await matchmakingDb.joinMatchmakingQueue(userId, eloRating)
      return !!result
    } catch (error) {
      console.error('Error entering matchmaking:', error)
      return false
    }
  }

  async cancelMatchmaking(userId: string): Promise<boolean> {
    try {
      // Clear any existing interval
      const interval = MatchmakingService.matchmakingIntervals.get(userId)
      if (interval) {
        clearInterval(interval)
        MatchmakingService.matchmakingIntervals.delete(userId)
      }

      return await matchmakingDb.removeFromMatchmakingQueue(userId)
    } catch (error) {
      console.error('Error canceling matchmaking:', error)
      return false
    }
  }

  async findMatch(userId: string): Promise<string | null> {
    try {
      // Try to find opponent with expanding ELO range
      const eloRanges = [
        GAME_CONFIG.MATCHMAKING.ELO_RANGE_INITIAL,
        GAME_CONFIG.MATCHMAKING.ELO_RANGE_INITIAL * 2, // Expanded range
        GAME_CONFIG.MATCHMAKING.ELO_RANGE_INITIAL * 4  // Max range
      ]

      for (const eloRange of eloRanges) {
        const opponentId = await matchmakingDb.findMatchmakingOpponent(userId, eloRange)
        
        if (opponentId) {
          // Create game session
          const gameSession = await gameDb.createGameSession(userId, opponentId)
          
          if (gameSession) {
            // Mark both users as matched
            await matchmakingDb.markUsersAsMatched(userId, opponentId)
            
            // Remove both users from queue
            await matchmakingDb.removeFromMatchmakingQueue(userId)
            await matchmakingDb.removeFromMatchmakingQueue(opponentId)
            
            return opponentId
          }
        }

        // Wait before expanding range
        await new Promise(resolve => setTimeout(resolve, 10000)) // 10 seconds
      }

      return null
    } catch (error) {
      console.error('Error finding match:', error)
      return null
    }
  }

  async getMatchmakingStatus(userId: string): Promise<MatchmakingStatus> {
    try {
      const queueEntry = await matchmakingDb.getMatchmakingQueueStatus(userId)
      
      if (!queueEntry) {
        return {
          status: 'idle',
          eloRange: 0,
          timeElapsed: 0,
          estimatedWaitTime: 0
        }
      }

      const timeElapsed = Date.now() - new Date(queueEntry.joined_at).getTime()
      const estimatedWaitTime = await this.getEstimatedWaitTime(1200) // Default ELO rating

      return {
        status: 'searching',
        eloRange: GAME_CONFIG.MATCHMAKING.ELO_RANGE_INITIAL,
        timeElapsed: Math.floor(timeElapsed / 1000), // Convert to seconds
        estimatedWaitTime
      }
    } catch (error) {
      console.error('Error getting matchmaking status:', error)
      return {
        status: 'error',
        eloRange: 0,
        timeElapsed: 0,
        estimatedWaitTime: 0
      }
    }
  }

  async isUserInQueue(userId: string): Promise<boolean> {
    try {
      return await matchmakingDb.isUserInMatchmakingQueue(userId)
    } catch (error) {
      console.error('Error checking if user is in queue:', error)
      return false
    }
  }

  async getEstimatedWaitTime(userElo: number): Promise<number> {
    try {
      return await matchmakingDb.getEstimatedWaitTime(userElo)
    } catch (error) {
      console.error('Error getting estimated wait time:', error)
      return 30 // Default 30 seconds
    }
  }

  async getQueueStats(): Promise<{
    totalInQueue: number
    averageElo: number
    averageWaitTime: number
  }> {
    try {
      return await matchmakingDb.getMatchmakingStats()
    } catch (error) {
      console.error('Error getting queue stats:', error)
      return { totalInQueue: 0, averageElo: 1200, averageWaitTime: 30 }
    }
  }

  async cleanupQueue(): Promise<number> {
    try {
      return await matchmakingDb.cleanupMatchmakingQueue()
    } catch (error) {
      console.error('Error cleaning up queue:', error)
      return 0
    }
  }

  /**
   * Start matchmaking process for a user
   */
  async startMatchmaking(userId: string, eloRating: number): Promise<boolean> {
    try {
      // Enter matchmaking queue
      const entered = await this.enterMatchmaking(userId, eloRating)
      if (!entered) {
        return false
      }

      // Start looking for matches
      const interval = setInterval(async () => {
        const opponentId = await this.findMatch(userId)
        
        if (opponentId) {
          // Match found, clear interval
          clearInterval(interval)
          MatchmakingService.matchmakingIntervals.delete(userId)
          
          // Emit match found event (this would be handled by real-time subscriptions)
          // For now, we'll just log it
          console.log(`Match found for user ${userId} with opponent ${opponentId}`)
        }
      }, 2000) // Check every 2 seconds

      // Store interval for cleanup
      MatchmakingService.matchmakingIntervals.set(userId, interval)

      // Set timeout to cancel matchmaking after max wait time
      setTimeout(async () => {
        const interval = MatchmakingService.matchmakingIntervals.get(userId)
        if (interval) {
          clearInterval(interval)
          MatchmakingService.matchmakingIntervals.delete(userId)
          await this.cancelMatchmaking(userId)
        }
      }, GAME_CONFIG.MATCHMAKING.QUEUE_TIMEOUT_SECONDS * 1000) // Convert to milliseconds

      return true
    } catch (error) {
      console.error('Error starting matchmaking:', error)
      return false
    }
  }

  async startTestMatch(userId: string): Promise<string> {
    const uniqueSegment =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)

    const testGameId = `test-${uniqueSegment}`
    console.log(`Test match created for user ${userId}: ${testGameId}`)
    return testGameId
  }

  /**
   * Stop matchmaking process for a user
   */
  async stopMatchmaking(userId: string): Promise<boolean> {
    try {
      // Clear interval
      const interval = MatchmakingService.matchmakingIntervals.get(userId)
      if (interval) {
        clearInterval(interval)
        MatchmakingService.matchmakingIntervals.delete(userId)
      }

      // Remove from queue
      return await this.cancelMatchmaking(userId)
    } catch (error) {
      console.error('Error stopping matchmaking:', error)
      return false
    }
  }

  /**
   * Get all active matchmaking processes
   */
  static getActiveMatchmakingUsers(): string[] {
    return Array.from(MatchmakingService.matchmakingIntervals.keys())
  }

  /**
   * Clean up all matchmaking intervals (for server shutdown)
   */
  static cleanupAllMatchmaking(): void {
    MatchmakingService.matchmakingIntervals.forEach((interval) => {
      clearInterval(interval)
    })
    MatchmakingService.matchmakingIntervals.clear()
  }
}
