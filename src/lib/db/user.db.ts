import { createClient } from '@/lib/supabase/server'
import { Player } from '@/types/game.types'

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

  // Transform database result to Player interface
  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name || data.username,
    avatarUrl: data.avatar_url,
    eloRating: data.elo_rating,
    gamesPlayed: 0, // TODO: Add to database schema
    gamesWon: 0, // TODO: Add to database schema
    isOnline: true
  }
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

  // Transform database result to Player interface
  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name || data.username,
    avatarUrl: data.avatar_url,
    eloRating: data.elo_rating,
    gamesPlayed: 0, // TODO: Add to database schema
    gamesWon: 0, // TODO: Add to database schema
    isOnline: true
  }
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

  // Transform database result to Player interface
  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name || data.username,
    avatarUrl: data.avatar_url,
    eloRating: data.elo_rating,
    gamesPlayed: 0, // TODO: Add to database schema
    gamesWon: 0, // TODO: Add to database schema
    isOnline: true
  }
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

  // Transform database result to Player interface
  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name || data.username,
    avatarUrl: data.avatar_url,
    eloRating: data.elo_rating,
    gamesPlayed: 0, // TODO: Add to database schema
    gamesWon: 0, // TODO: Add to database schema
    isOnline: true
  }
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
export async function getUserMatchHistory(userId: string, limit: number = 10): Promise<MatchHistoryItem[]> {
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
export async function getUserGameStats(userId: string): Promise<UserGameStats | null> {
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
    totalGames: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    averageScore: 0,
    currentStreak: 0
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

  // Transform database results to Player interface
  return (data || []).map(player => ({
    id: player.id,
    username: player.username,
    displayName: player.display_name || player.username,
    avatarUrl: player.avatar_url,
    eloRating: player.elo_rating,
    gamesPlayed: 0, // TODO: Add to database schema
    gamesWon: 0, // TODO: Add to database schema
    isOnline: true
  }))
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

  // Transform database results to Player interface
  return (data || []).map(player => ({
    id: player.id,
    username: player.username,
    displayName: player.display_name || player.username,
    avatarUrl: player.avatar_url,
    eloRating: player.elo_rating,
    gamesPlayed: 0, // TODO: Add to database schema
    gamesWon: 0, // TODO: Add to database schema
    isOnline: true
  }))
}
