import { User, UserInsert, UserUpdate, Player } from '@/types/game.types'

interface MatchHistoryItem {
  id: string
  player1: Player
  player2: Player
  winner: Player | null
  created_at: string
  completed_at: string | null
}

interface UserGameStats {
  totalGames: number
  wins: number
  losses: number
  winRate: number
  averageScore: number
  currentStreak: number
}

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
  getUserMatchHistory(userId: string, limit?: number): Promise<MatchHistoryItem[]>

  /**
   * Get user's game statistics
   */
  getUserGameStats(userId: string): Promise<UserGameStats | null>

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
