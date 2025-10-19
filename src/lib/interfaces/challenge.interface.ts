import { 
  Challenge, 
  ChallengeWithUsers, 
  CreateChallengeRequest, 
  ChallengeResponse,
  ChallengeListResponse 
} from '@/types/challenge.types'

export interface ChallengeServiceInterface {
  /**
   * Create a new challenge
   */
  createChallenge(challengerId: string, request: CreateChallengeRequest): Promise<ChallengeResponse>

  /**
   * Accept a challenge
   */
  acceptChallenge(challengeId: string, userId: string): Promise<ChallengeResponse>

  /**
   * Decline a challenge
   */
  declineChallenge(challengeId: string, userId: string): Promise<ChallengeResponse>

  /**
   * Cancel a challenge
   */
  cancelChallenge(challengeId: string, userId: string): Promise<ChallengeResponse>

  /**
   * Get challenges for a user
   */
  getUserChallenges(userId: string): Promise<ChallengeListResponse>

  /**
   * Get a specific challenge
   */
  getChallenge(challengeId: string): Promise<ChallengeWithUsers | null>

  /**
   * Get pending challenges for a user
   */
  getPendingChallenges(userId: string): Promise<ChallengeWithUsers[]>

  /**
   * Get sent challenges for a user
   */
  getSentChallenges(userId: string): Promise<ChallengeWithUsers[]>

  /**
   * Check if user can challenge another user
   */
  canUserChallenge(challengerId: string, challengedId: string): Promise<boolean>

  /**
   * Get challenge count for notifications
   */
  getChallengeCount(userId: string): Promise<number>

  /**
   * Check if there's a pending challenge between two users
   */
  hasPendingChallenge(userId1: string, userId2: string): Promise<boolean>

  /**
   * Get challenge status between two users
   */
  getChallengeStatus(userId1: string, userId2: string): Promise<{
    canChallenge: boolean
    hasPendingChallenge: boolean
    challengeDirection?: 'sent' | 'received'
  }>
}
