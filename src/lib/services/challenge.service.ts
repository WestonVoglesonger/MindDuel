import { 
  Challenge, 
  ChallengeWithUsers, 
  CreateChallengeRequest, 
  ChallengeResponse,
  ChallengeListResponse 
} from '@/types/challenge.types'
import * as challengeDb from '@/lib/db/challenge.db'
import * as gameDb from '@/lib/db/game.db'
import * as matchmakingDb from '@/lib/db/matchmaking.db'

export class ChallengeService {
  /**
   * Create a new challenge
   */
  async createChallenge(
    challengerId: string, 
    request: CreateChallengeRequest
  ): Promise<ChallengeResponse> {
    try {
      // Validate that user can challenge
      const canChallenge = await challengeDb.canUserChallenge(challengerId, request.challenged_id)
      if (!canChallenge) {
        return {
          success: false,
          error: 'Cannot challenge this user. They may be in a game or you may have a pending challenge.'
        }
      }

      // Create the challenge
      const challenge = await challengeDb.createChallenge(
        challengerId,
        request.challenged_id,
        request.message
      )

      if (!challenge) {
        return {
          success: false,
          error: 'Failed to create challenge'
        }
      }

      return {
        success: true,
        challenge
      }
    } catch (error) {
      console.error('Error creating challenge:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  }

  /**
   * Accept a challenge
   */
  async acceptChallenge(challengeId: string, userId: string): Promise<ChallengeResponse> {
    try {
      // Use the database function to accept challenge and create game session atomically
      const gameSessionId = await challengeDb.acceptChallenge(challengeId, userId)
      
      if (!gameSessionId) {
        return {
          success: false,
          error: 'Failed to accept challenge. It may have expired or been cancelled.'
        }
      }

      // Get the updated challenge
      const challenge = await challengeDb.getChallenge(challengeId)
      
      return {
        success: true,
        challenge: challenge || undefined,
        game_session_id: gameSessionId
      }
    } catch (error) {
      console.error('Error accepting challenge:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  }

  /**
   * Decline a challenge
   */
  async declineChallenge(challengeId: string, userId: string): Promise<ChallengeResponse> {
    try {
      const success = await challengeDb.updateChallengeStatus(challengeId, 'declined', userId)
      
      if (!success) {
        return {
          success: false,
          error: 'Failed to decline challenge'
        }
      }

      const challenge = await challengeDb.getChallenge(challengeId)
      
      return {
        success: true,
        challenge: challenge || undefined
      }
    } catch (error) {
      console.error('Error declining challenge:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  }

  /**
   * Cancel a challenge
   */
  async cancelChallenge(challengeId: string, userId: string): Promise<ChallengeResponse> {
    try {
      const success = await challengeDb.updateChallengeStatus(challengeId, 'cancelled', userId)
      
      if (!success) {
        return {
          success: false,
          error: 'Failed to cancel challenge'
        }
      }

      const challenge = await challengeDb.getChallenge(challengeId)
      
      return {
        success: true,
        challenge: challenge || undefined
      }
    } catch (error) {
      console.error('Error cancelling challenge:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  }

  /**
   * Get challenges for a user
   */
  async getUserChallenges(userId: string): Promise<ChallengeListResponse> {
    try {
      const challenges = await challengeDb.getUserChallenges(userId)
      const pendingCount = challenges.received.filter(c => c.status === 'pending').length

      return {
        sent: challenges.sent,
        received: challenges.received,
        pending_count: pendingCount
      }
    } catch (error) {
      console.error('Error getting user challenges:', error)
      return {
        sent: [],
        received: [],
        pending_count: 0
      }
    }
  }

  /**
   * Get a specific challenge
   */
  async getChallenge(challengeId: string): Promise<ChallengeWithUsers | null> {
    try {
      return await challengeDb.getChallengeWithUsers(challengeId)
    } catch (error) {
      console.error('Error getting challenge:', error)
      return null
    }
  }

  /**
   * Get pending challenges for a user
   */
  async getPendingChallenges(userId: string): Promise<ChallengeWithUsers[]> {
    try {
      return await challengeDb.getPendingChallengesForUser(userId)
    } catch (error) {
      console.error('Error getting pending challenges:', error)
      return []
    }
  }

  /**
   * Get sent challenges for a user
   */
  async getSentChallenges(userId: string): Promise<ChallengeWithUsers[]> {
    try {
      return await challengeDb.getSentChallenges(userId)
    } catch (error) {
      console.error('Error getting sent challenges:', error)
      return []
    }
  }

  /**
   * Check if user can challenge another user
   */
  async canUserChallenge(challengerId: string, challengedId: string): Promise<boolean> {
    try {
      return await challengeDb.canUserChallenge(challengerId, challengedId)
    } catch (error) {
      console.error('Error checking if user can challenge:', error)
      return false
    }
  }

  /**
   * Get challenge count for notifications
   */
  async getChallengeCount(userId: string): Promise<number> {
    try {
      return await challengeDb.getChallengeCount(userId)
    } catch (error) {
      console.error('Error getting challenge count:', error)
      return 0
    }
  }

  /**
   * Check if there's a pending challenge between two users
   */
  async hasPendingChallenge(userId1: string, userId2: string): Promise<boolean> {
    try {
      const challenges = await challengeDb.getUserChallenges(userId1)
      const allChallenges = [...challenges.sent, ...challenges.received]
      
      return allChallenges.some(challenge => 
        (challenge.challenger_id === userId1 && challenge.challenged_id === userId2) ||
        (challenge.challenger_id === userId2 && challenge.challenged_id === userId1)
      ) && allChallenges.some(challenge => challenge.status === 'pending')
    } catch (error) {
      console.error('Error checking pending challenge:', error)
      return false
    }
  }

  /**
   * Get challenge status between two users
   */
  async getChallengeStatus(userId1: string, userId2: string): Promise<{
    canChallenge: boolean
    hasPendingChallenge: boolean
    challengeDirection?: 'sent' | 'received'
  }> {
    try {
      const canChallenge = await this.canUserChallenge(userId1, userId2)
      const hasPendingChallenge = await this.hasPendingChallenge(userId1, userId2)
      
      let challengeDirection: 'sent' | 'received' | undefined
      if (hasPendingChallenge) {
        const challenges = await this.getUserChallenges(userId1)
        const sentChallenge = challenges.sent.find(c => 
          c.challenged_id === userId2 && c.status === 'pending'
        )
        challengeDirection = sentChallenge ? 'sent' : 'received'
      }

      return {
        canChallenge,
        hasPendingChallenge,
        challengeDirection
      }
    } catch (error) {
      console.error('Error getting challenge status:', error)
      return {
        canChallenge: false,
        hasPendingChallenge: false
      }
    }
  }
}
