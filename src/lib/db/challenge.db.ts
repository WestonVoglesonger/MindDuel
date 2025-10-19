import { createClient } from '@/lib/supabase/server'
import { Challenge, ChallengeWithUsers, CreateChallengeRequest } from '@/types/challenge.types'

/**
 * Create a new challenge
 */
export async function createChallenge(
  challengerId: string,
  challengedId: string,
  message?: string
): Promise<Challenge | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('challenges')
    .insert({
      challenger_id: challengerId,
      challenged_id: challengedId,
      message: message || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating challenge:', error)
    return null
  }

  return data
}

/**
 * Get challenge by ID
 */
export async function getChallenge(challengeId: string): Promise<Challenge | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .single()

  if (error) {
    console.error('Error getting challenge:', error)
    return null
  }

  return data
}

/**
 * Get challenge with user details
 */
export async function getChallengeWithUsers(challengeId: string): Promise<ChallengeWithUsers | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      challenger:challenger_id (
        id,
        username,
        display_name,
        avatar_url,
        elo_rating
      ),
      challenged:challenged_id (
        id,
        username,
        display_name,
        avatar_url,
        elo_rating
      )
    `)
    .eq('id', challengeId)
    .single()

  if (error) {
    console.error('Error getting challenge with users:', error)
    return null
  }

  return data as ChallengeWithUsers
}

/**
 * Update challenge status
 */
export async function updateChallengeStatus(
  challengeId: string,
  status: 'accepted' | 'declined' | 'cancelled' | 'expired',
  userId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('challenges')
    .update({
      status,
      responded_at: status !== 'cancelled' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', challengeId)
    .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)

  if (error) {
    console.error('Error updating challenge status:', error)
    return false
  }

  return true
}

/**
 * Get challenges for a user (both sent and received)
 */
export async function getUserChallenges(userId: string): Promise<{
  sent: ChallengeWithUsers[]
  received: ChallengeWithUsers[]
}> {
  const supabase = await createClient()

  // Get sent challenges
  const { data: sentChallenges, error: sentError } = await supabase
    .from('challenges')
    .select(`
      *,
      challenger:challenger_id (
        id,
        username,
        display_name,
        avatar_url,
        elo_rating
      ),
      challenged:challenged_id (
        id,
        username,
        display_name,
        avatar_url,
        elo_rating
      )
    `)
    .eq('challenger_id', userId)
    .order('created_at', { ascending: false })

  // Get received challenges
  const { data: receivedChallenges, error: receivedError } = await supabase
    .from('challenges')
    .select(`
      *,
      challenger:challenger_id (
        id,
        username,
        display_name,
        avatar_url,
        elo_rating
      ),
      challenged:challenged_id (
        id,
        username,
        display_name,
        avatar_url,
        elo_rating
      )
    `)
    .eq('challenged_id', userId)
    .order('created_at', { ascending: false })

  if (sentError || receivedError) {
    console.error('Error getting user challenges:', sentError || receivedError)
    return { sent: [], received: [] }
  }

  return {
    sent: (sentChallenges || []) as ChallengeWithUsers[],
    received: (receivedChallenges || []) as ChallengeWithUsers[]
  }
}

/**
 * Get pending challenges for a user
 */
export async function getPendingChallengesForUser(userId: string): Promise<ChallengeWithUsers[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      challenger:challenger_id (
        id,
        username,
        display_name,
        avatar_url,
        elo_rating
      ),
      challenged:challenged_id (
        id,
        username,
        display_name,
        avatar_url,
        elo_rating
      )
    `)
    .eq('challenged_id', userId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting pending challenges:', error)
    return []
  }

  return (data || []) as ChallengeWithUsers[]
}

/**
 * Get sent challenges for a user
 */
export async function getSentChallenges(userId: string): Promise<ChallengeWithUsers[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      challenger:challenger_id (
        id,
        username,
        display_name,
        avatar_url,
        elo_rating
      ),
      challenged:challenged_id (
        id,
        username,
        display_name,
        avatar_url,
        elo_rating
      )
    `)
    .eq('challenger_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting sent challenges:', error)
    return []
  }

  return (data || []) as ChallengeWithUsers[]
}

/**
 * Check if user can challenge another user
 */
export async function canUserChallenge(challengerId: string, challengedId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('can_challenge_user', {
    p_challenger_id: challengerId,
    p_challenged_id: challengedId
  })

  if (error) {
    console.error('Error checking if user can challenge:', error)
    return false
  }

  return data || false
}

/**
 * Accept a challenge and create game session
 */
export async function acceptChallenge(challengeId: string, userId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('accept_challenge', {
    p_challenge_id: challengeId,
    p_user_id: userId
  })

  if (error) {
    console.error('Error accepting challenge:', error)
    return null
  }

  return data
}

/**
 * Delete/cancel a challenge
 */
export async function deleteChallenge(challengeId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('challenges')
    .delete()
    .eq('id', challengeId)
    .eq('challenger_id', userId)
    .eq('status', 'pending')

  if (error) {
    console.error('Error deleting challenge:', error)
    return false
  }

  return true
}

/**
 * Get challenge count for user (for notifications)
 */
export async function getChallengeCount(userId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('challenges')
    .select('*', { count: 'exact', head: true })
    .eq('challenged_id', userId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())

  if (error) {
    console.error('Error getting challenge count:', error)
    return 0
  }

  return count || 0
}
