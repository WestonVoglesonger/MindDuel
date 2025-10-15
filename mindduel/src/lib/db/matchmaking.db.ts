import { createClient } from '@/lib/supabase/server'
import { MatchmakingQueue, MatchmakingQueueInsert } from '@/types/game.types'

/**
 * Join the matchmaking queue
 */
export async function joinMatchmakingQueue(userId: string, eloRating: number): Promise<MatchmakingQueue | null> {
  const supabase = createClient()
  
  // First, remove user from queue if they're already in it
  await supabase
    .from('matchmaking_queue')
    .delete()
    .eq('user_id', userId)

  // Add user to queue
  const { data, error } = await supabase
    .from('matchmaking_queue')
    .insert({
      user_id: userId,
      elo_rating: eloRating,
      status: 'waiting'
    })
    .select()
    .single()

  if (error) {
    console.error('Error joining matchmaking queue:', error)
    return null
  }

  return data
}

/**
 * Remove user from matchmaking queue
 */
export async function removeFromMatchmakingQueue(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('matchmaking_queue')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error removing from matchmaking queue:', error)
    return false
  }

  return true
}

/**
 * Find an opponent for matchmaking
 */
export async function findMatchmakingOpponent(userId: string, eloRange: number = 100): Promise<string | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .rpc('find_matchmaking_opponent', {
      p_user_id: userId,
      p_elo_range: eloRange
    })

  if (error) {
    console.error('Error finding matchmaking opponent:', error)
    return null
  }

  return data
}

/**
 * Get matchmaking queue status
 */
export async function getMatchmakingQueueStatus(userId: string): Promise<MatchmakingQueue | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('matchmaking_queue')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'waiting')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // User not in queue
      return null
    }
    console.error('Error fetching matchmaking queue status:', error)
    return null
  }

  return data
}

/**
 * Get all users in matchmaking queue
 */
export async function getMatchmakingQueue(): Promise<MatchmakingQueue[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('matchmaking_queue')
    .select('*')
    .eq('status', 'waiting')
    .order('joined_at')

  if (error) {
    console.error('Error fetching matchmaking queue:', error)
    return []
  }

  return data || []
}

/**
 * Mark users as matched in queue
 */
export async function markUsersAsMatched(user1Id: string, user2Id: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('matchmaking_queue')
    .update({ status: 'matched' })
    .in('user_id', [user1Id, user2Id])

  if (error) {
    console.error('Error marking users as matched:', error)
    return false
  }

  return true
}

/**
 * Clean up abandoned matchmaking entries
 */
export async function cleanupMatchmakingQueue(): Promise<number> {
  const supabase = createClient()
  
  const { count, error } = await supabase
    .from('matchmaking_queue')
    .delete()
    .eq('status', 'waiting')
    .lt('joined_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // 10 minutes ago
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error cleaning up matchmaking queue:', error)
    return 0
  }

  return count || 0
}

/**
 * Get estimated wait time for matchmaking
 */
export async function getEstimatedWaitTime(userElo: number): Promise<number> {
  const supabase = createClient()
  
  // Count users within ELO range
  const { count, error } = await supabase
    .from('matchmaking_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'waiting')
    .gte('elo_rating', userElo - 100)
    .lte('elo_rating', userElo + 100)

  if (error) {
    console.error('Error getting estimated wait time:', error)
    return 30 // Default 30 seconds
  }

  // Simple estimation: more users = shorter wait time
  if (count && count > 1) {
    return Math.max(5, 30 - (count * 2)) // Minimum 5 seconds
  }

  return 30 // Default wait time
}

/**
 * Check if user is already in matchmaking queue
 */
export async function isUserInMatchmakingQueue(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('matchmaking_queue')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'waiting')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return false // User not in queue
    }
    console.error('Error checking matchmaking queue status:', error)
    return false
  }

  return !!data
}

/**
 * Get matchmaking statistics
 */
export async function getMatchmakingStats(): Promise<{
  totalInQueue: number
  averageElo: number
  averageWaitTime: number
}> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('matchmaking_queue')
    .select('elo_rating, joined_at')
    .eq('status', 'waiting')

  if (error) {
    console.error('Error fetching matchmaking stats:', error)
    return { totalInQueue: 0, averageElo: 1200, averageWaitTime: 30 }
  }

  const totalInQueue = data?.length || 0
  const averageElo = totalInQueue > 0 
    ? data.reduce((sum, user) => sum + user.elo_rating, 0) / totalInQueue
    : 1200

  // Calculate average wait time based on how long users have been waiting
  const now = new Date()
  const averageWaitTime = totalInQueue > 0
    ? data.reduce((sum, user) => {
        const waitTime = (now.getTime() - new Date(user.joined_at).getTime()) / 1000
        return sum + waitTime
      }, 0) / totalInQueue
    : 30

  return {
    totalInQueue,
    averageElo: Math.round(averageElo),
    averageWaitTime: Math.round(averageWaitTime)
  }
}
