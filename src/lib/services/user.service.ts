import { UserServiceInterface } from '@/lib/interfaces/user.interface'
import { Player } from '@/types/game.types'
import * as userDb from '@/lib/db/user.db'

// Type aliases
type User = Player
type UserInsert = {
  id: string
  username: string
  display_name?: string
  avatar_url?: string
  elo_rating?: number
}
type UserUpdate = {
  username?: string
  display_name?: string
  avatar_url?: string
  elo_rating?: number
}

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
import { getSupabaseClient } from '@/lib/supabase/universal-client'

export class UserService implements UserServiceInterface {
  async getUserById(userId: string): Promise<User | null> {
    return await userDb.getUserById(userId)
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await userDb.getUserByUsername(username)
  }

  async createUser(userData: UserInsert): Promise<User | null> {
    return await userDb.createUser(userData)
  }

  async updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
    return await userDb.updateUser(userId, updates)
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    return await userDb.isUsernameAvailable(username)
  }

  async getUserMatchHistory(userId: string, limit: number = 10): Promise<MatchHistoryItem[]> {
    return await userDb.getUserMatchHistory(userId, limit)
  }

  async getUserGameStats(userId: string): Promise<UserGameStats | null> {
    return await userDb.getUserGameStats(userId)
  }

  async getLeaderboard(limit: number = 100): Promise<User[]> {
    return await userDb.getLeaderboard(limit)
  }

  async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    return await userDb.searchUsers(query, limit)
  }

  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    const supabase = await getSupabaseClient()
    
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      
      // Upload file to Supabase Storage
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (error) {
        console.error('Error uploading avatar:', error)
        return null
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update user profile with new avatar URL
      const updatedUser = await this.updateUser(userId, { avatar_url: publicUrl })
      
      if (updatedUser) {
        return publicUrl
      }

      return null
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return null
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    const supabase = await getSupabaseClient()
    
    try {
      // Delete user from auth (this will cascade to users table due to foreign key)
      const { error } = await supabase.auth.admin.deleteUser(userId)
      
      if (error) {
        console.error('Error deleting user:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }

  /**
   * Create user profile after authentication
   */
  async createUserProfile(
    userId: string,
    email: string,
    username?: string,
    displayName?: string
  ): Promise<User | null> {
    // Generate username if not provided
    const finalUsername = username || `user_${userId.substring(0, 8)}`
    
    // Check if username is available
    const isAvailable = await this.isUsernameAvailable(finalUsername)
    if (!isAvailable) {
      // Generate alternative username
      const alternativeUsername = `${finalUsername}_${Date.now()}`
      return await this.createUser({
        id: userId,
        username: alternativeUsername,
        display_name: displayName || email.split('@')[0],
        elo_rating: 1200
      })
    }

    return await this.createUser({
      id: userId,
      username: finalUsername,
      display_name: displayName || email.split('@')[0],
      elo_rating: 1200
    })
  }

  /**
   * Update user's ELO rating and game stats
   */
  async updateUserStats(
    userId: string,
    eloChange: number,
    gameWon: boolean
  ): Promise<User | null> {
    const user = await this.getUserById(userId)
    if (!user) {
      return null
    }

    const newEloRating = Math.max(0, user.eloRating + eloChange)
    const newGamesPlayed = user.gamesPlayed + 1
    const newGamesWon = gameWon ? user.gamesWon + 1 : user.gamesWon

    // TODO: Update database schema to include games_played and games_won fields
    // For now, just update the ELO rating in the database
    await this.updateUser(userId, {
      elo_rating: newEloRating
    })

    // Return updated Player object
    return {
      ...user,
      eloRating: newEloRating,
      gamesPlayed: newGamesPlayed,
      gamesWon: newGamesWon
    }
  }

  /**
   * Get user's ELO tier information
   */
  async getUserEloTier(userId: string): Promise<{
    tier: string
    color: string
    min: number
    max: number
    currentRating: number
  } | null> {
    const user = await this.getUserById(userId)
    if (!user) {
      return null
    }

    const tier = this.getEloTier(user.eloRating)
    return {
      ...tier,
      currentRating: user.eloRating
    }
  }

  /**
   * Get ELO tier for a rating
   */
  private getEloTier(rating: number): {
    tier: string
    color: string
    min: number
    max: number
  } {
    if (rating < 1000) {
      return { tier: 'Novice', color: 'bg-gray-500', min: 0, max: 1000 }
    } else if (rating < 1200) {
      return { tier: 'Bronze', color: 'bg-orange-600', min: 1000, max: 1200 }
    } else if (rating < 1400) {
      return { tier: 'Silver', color: 'bg-gray-400', min: 1200, max: 1400 }
    } else if (rating < 1600) {
      return { tier: 'Gold', color: 'bg-yellow-500', min: 1400, max: 1600 }
    } else if (rating < 1800) {
      return { tier: 'Platinum', color: 'bg-blue-500', min: 1600, max: 1800 }
    } else if (rating < 2000) {
      return { tier: 'Diamond', color: 'bg-purple-500', min: 1800, max: 2000 }
    } else {
      return { tier: 'Master', color: 'bg-red-500', min: 2000, max: Infinity }
    }
  }
}
