import { createClient } from '@/lib/supabase/client'
import { Challenge, ChallengeWithUsers, CreateChallengeRequest } from '@/types/challenge.types'

/**
 * Create a new challenge
 */
export async function createChallenge(
  challengerId: string,
  challengedId: string,
  message?: string
): Promise<Challenge | null> {
  const supabase = createClient()

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

  return data ? {
    ...data,
    message: data.message ?? undefined,
    responded_at: data.responded_at ?? undefined
  } : null
}

/**
 * Get challenge by ID
 */
export async function getChallenge(challengeId: string): Promise<Challenge | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .single()

  if (error) {
    console.error('Error getting challenge:', error)
    return null
  }

  return data ? {
    ...data,
    message: data.message ?? undefined,
    responded_at: data.responded_at ?? undefined
  } : null
}

/**
 * Get challenge with user details
 */
export async function getChallengeWithUsers(challengeId: string): Promise<ChallengeWithUsers | null> {
  const supabase = createClient()

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

  return data ? {
    ...data,
    message: data.message ?? undefined,
    responded_at: data.responded_at ?? undefined
  } as unknown as ChallengeWithUsers : null
}

/**
 * Update challenge status
 */
export async function updateChallengeStatus(
  challengeId: string,
  status: 'accepted' | 'declined' | 'cancelled' | 'expired',
  userId: string
): Promise<boolean> {
  const supabase = createClient()

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
  const supabase = createClient()

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
    sent: (sentChallenges || []).map(challenge => ({
      ...challenge,
      message: challenge.message ?? undefined,
      responded_at: challenge.responded_at ?? undefined
    })) as unknown as ChallengeWithUsers[],
    received: (receivedChallenges || []).map(challenge => ({
      ...challenge,
      message: challenge.message ?? undefined,
      responded_at: challenge.responded_at ?? undefined
    })) as unknown as ChallengeWithUsers[]
  }
}

/**
 * Get pending challenges for a user
 */
export async function getPendingChallengesForUser(userId: string): Promise<ChallengeWithUsers[]> {
  const supabase = createClient()

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

  return (data || []).map(challenge => ({
    ...challenge,
    message: challenge.message ?? undefined,
    responded_at: challenge.responded_at ?? undefined
  })) as unknown as ChallengeWithUsers[]
}

/**
 * Get sent challenges for a user
 */
export async function getSentChallenges(userId: string): Promise<ChallengeWithUsers[]> {
  const supabase = createClient()

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

  return (data || []).map(challenge => ({
    ...challenge,
    message: challenge.message ?? undefined,
    responded_at: challenge.responded_at ?? undefined
  })) as unknown as ChallengeWithUsers[]
}

/**
 * Check if user can challenge another user
 */
export async function canUserChallenge(challengerId: string, challengedId: string): Promise<boolean> {
  const supabase = createClient()

  // Check if there are any pending challenges between these users
  const { data, error } = await supabase
    .from('challenges')
    .select('id')
    .or(`and(challenger_id.eq.${challengerId},challenged_id.eq.${challengedId}),and(challenger_id.eq.${challengedId},challenged_id.eq.${challengerId})`)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())

  if (error) {
    console.error('Error checking if user can challenge:', error)
    return false
  }

  return (data || []).length === 0
}

/**
 * Accept a challenge and create game session
 */
export async function acceptChallenge(challengeId: string, userId: string): Promise<string | null> {
  const supabase = createClient()

  // First, update the challenge status
  const { error: updateError } = await supabase
    .from('challenges')
    .update({
      status: 'accepted',
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', challengeId)
    .eq('challenged_id', userId)
    .eq('status', 'pending')

  if (updateError) {
    console.error('Error accepting challenge:', updateError)
    return null
  }

  // For now, return the challenge ID as the game session ID
  // In a real implementation, you'd create a game session here
  return challengeId
}

/**
 * Delete/cancel a challenge
 */
export async function deleteChallenge(challengeId: string, userId: string): Promise<boolean> {
  const supabase = createClient()

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
  const supabase = createClient()

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
