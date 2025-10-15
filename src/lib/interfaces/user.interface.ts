import { User, UserInsert, UserUpdate } from '@/types/game.types'

export interface UserServiceInterface {
  /**
   * Get user by ID
   */
  getUserById(userId: string): Promise<User | null>

  /**
   * Get user by username
   */
  getUserByUsername(username: string): Promise<User | null>

  /**
   * Create a new user profile
   */
  createUser(userData: UserInsert): Promise<User | null>

  /**
   * Update user profile
   */
  updateUser(userId: string, updates: UserUpdate): Promise<User | null>

  /**
   * Check if username is available
   */
  isUsernameAvailable(username: string): Promise<boolean>

  /**
   * Get user's match history
   */
  getUserMatchHistory(userId: string, limit?: number): Promise<any[]>

  /**
   * Get user's game statistics
   */
  getUserGameStats(userId: string): Promise<any>

  /**
   * Get leaderboard (top players by ELO)
   */
  getLeaderboard(limit?: number): Promise<User[]>

  /**
   * Search users by username
   */
  searchUsers(query: string, limit?: number): Promise<User[]>

  /**
   * Upload user avatar
   */
  uploadAvatar(userId: string, file: File): Promise<string | null>

  /**
   * Delete user account
   */
  deleteUser(userId: string): Promise<boolean>
}
