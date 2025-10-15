import { createClient } from '@/lib/supabase/server'
import { MatchmakingQueue } from '@/types/game.types'

/**
 * Join the matchmaking queue
 */
export async function joinMatchmakingQueue(userId: string, eloRating: number): Promise<MatchmakingQueue | null> {
  const supabase = await createClient()
  
  // First, remove user from queue if they're already in it
  await supabase
    .from('matchmaking_queue')
    .delete()
    .eq('player_id', userId)

  // Add user to queue
  const { data, error } = await supabase
    .from('matchmaking_queue')
    .insert({
      player_id: userId,
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
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('matchmaking_queue')
    .delete()
    .eq('player_id', userId)

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
  const supabase = await createClient()

  // Simple implementation: find any waiting player that's not ourselves
  const { data, error } = await supabase
    .from('matchmaking_queue')
    .select('player_id')
    .eq('status', 'waiting')
    .neq('player_id', userId)
    .limit(1)
    .single()

  if (error || !data) {
    console.log('No opponent found or error:', error?.message)
    return null
  }

  return data.player_id
}

/**
 * Get matchmaking queue status
 */
export async function getMatchmakingQueueStatus(userId: string): Promise<MatchmakingQueue | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('matchmaking_queue')
    .select('*')
    .eq('player_id', userId)
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
  const supabase = await createClient()
  
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
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('matchmaking_queue')
    .update({ status: 'matched' })
    .in('player_id', [user1Id, user2Id])

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
  const supabase = await createClient()

  // First count the records to be deleted
  const { count: countBefore } = await supabase
    .from('matchmaking_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'waiting')
    .lt('joined_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())

  // Then delete them
  const { error } = await supabase
    .from('matchmaking_queue')
    .delete()
    .eq('status', 'waiting')
    .lt('joined_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())

  if (error) {
    console.error('Error cleaning up matchmaking queue:', error)
    return 0
  }

  return countBefore || 0
}

/**
 * Get estimated wait time for matchmaking
 */
export async function getEstimatedWaitTime(userElo: number): Promise<number> {
  const supabase = await createClient()

  // Count total waiting users (simplified since elo_rating field may not exist)
  const { count, error } = await supabase
    .from('matchmaking_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'waiting')

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
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('matchmaking_queue')
    .select('id')
    .eq('player_id', userId)
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
  const supabase = await createClient()
  
  const { count, error } = await supabase
    .from('matchmaking_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'waiting')

  if (error) {
    console.error('Error fetching matchmaking stats:', error)
    return { totalInQueue: 0, averageElo: 1200, averageWaitTime: 30 }
  }

  return {
    totalInQueue: count || 0,
    averageElo: 1200, // Default since elo_rating field doesn't exist
    averageWaitTime: 30
  }
}
