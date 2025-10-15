import { MatchmakingStatus } from '@/types/game.types'

export interface MatchmakingServiceInterface {
  /**
   * Enter matchmaking queue
   */
  enterMatchmaking(userId: string, eloRating: number): Promise<boolean>

  /**
   * Cancel matchmaking
   */
  cancelMatchmaking(userId: string): Promise<boolean>

  /**
   * Find a match for a user
   */
  findMatch(userId: string): Promise<string | null> // Returns opponent ID or null

  /**
   * Get matchmaking status for a user
   */
  getMatchmakingStatus(userId: string): Promise<MatchmakingStatus>

  /**
   * Check if user is in matchmaking queue
   */
  isUserInQueue(userId: string): Promise<boolean>

  /**
   * Get estimated wait time
   */
  getEstimatedWaitTime(userElo: number): Promise<number>

  /**
   * Get matchmaking queue statistics
   */
  getQueueStats(): Promise<{
    totalInQueue: number
    averageElo: number
    averageWaitTime: number
  }>

  /**
   * Clean up abandoned queue entries
   */
  cleanupQueue(): Promise<number>
}
