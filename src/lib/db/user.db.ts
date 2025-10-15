import { createClient } from '@/lib/supabase/server'
import { Player } from '@/types/game.types'

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

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<Player | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<Player | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    console.error('Error fetching user by username:', error)
    return null
  }

  return data
}

/**
 * Create a new user profile
 */
export async function createUser(userData: UserInsert): Promise<Player | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    return null
  }

  return data
}

/**
 * Update user profile
 */
export async function updateUser(userId: string, updates: UserUpdate): Promise<Player | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user:', error)
    return null
  }

  return data
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single()

  if (error && error.code === 'PGRST116') {
    // No rows returned, username is available
    return true
  }

  if (error) {
    console.error('Error checking username availability:', error)
    return false
  }

  return false // Username exists
}

/**
 * Get user's match history
 * TODO: Implement when match_history table is added
 */
export async function getUserMatchHistory(userId: string, limit: number = 10): Promise<any[]> {
  // const supabase = await createClient()
  // 
  // const { data, error } = await supabase
  //   .from('match_history')
  //   .select(`
  //     *,
  //     player1:users!match_history_player1_id_fkey(username, display_name, avatar_url),
  //     player2:users!match_history_player2_id_fkey(username, display_name, avatar_url),
  //     winner:users!match_history_winner_id_fkey(username, display_name, avatar_url)
  //   `)
  //   .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
  //   .order('completed_at', { ascending: false })
  //   .limit(limit)
  //
  // if (error) {
  //   console.error('Error fetching match history:', error)
  //   return []
  // }
  //
  // return data || []
  
  // Temporary return until match_history table is implemented
  return []
}

/**
 * Get user's game statistics
 * TODO: Implement when get_user_game_stats function is added
 */
export async function getUserGameStats(userId: string): Promise<any> {
  // const supabase = await createClient()
  // 
  // const { data, error } = await supabase
  //   .rpc('get_user_game_stats', { p_user_id: userId })
  //
  // if (error) {
  //   console.error('Error fetching user stats:', error)
  //   return null
  // }
  //
  // return data?.[0] || null
  
  // Temporary return until function is implemented
  return {
    total_games: 0,
    games_won: 0,
    win_rate: 0,
    current_elo: 1000,
    elo_tier: 'Novice'
  }
}

/**
 * Get leaderboard (top players by ELO)
 */
export async function getLeaderboard(limit: number = 100): Promise<Player[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('elo_rating', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }

  return data || []
}

/**
 * Search users by username
 */
export async function searchUsers(query: string, limit: number = 20): Promise<Player[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('username', `%${query}%`)
    .order('elo_rating', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error searching users:', error)
    return []
  }

  return data || []
}
