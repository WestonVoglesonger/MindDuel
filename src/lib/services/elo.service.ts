import { createClient } from '@/lib/supabase/server'
import { calculateEloChanges } from '@/lib/utils/elo-calculator'

export class EloService {
  /**
   * Update ELO ratings after a game
   */
  static async updateRatingsAfterGame(
    player1Id: string,
    player2Id: string,
    winnerId: string | null
  ): Promise<{
    player1NewRating: number
    player2NewRating: number
    player1Change: number
    player2Change: number
  } | null> {
    const supabase = await createClient()

    try {
      // Get current ratings
      const { data: player1Data, error: player1Error } = await supabase
        .from('users')
        .select('elo_rating')
        .eq('id', player1Id)
        .single()

      const { data: player2Data, error: player2Error } = await supabase
        .from('users')
        .select('elo_rating')
        .eq('id', player2Id)
        .single()

      if (player1Error || player2Error || !player1Data || !player2Data) {
        console.error('Error fetching player ratings:', player1Error || player2Error)
        return null
      }

      // Calculate ELO changes
      const changes = calculateEloChanges(
        player1Data.elo_rating,
        player2Data.elo_rating,
        winnerId,
        player1Id,
        player2Id
      )

      const player1NewRating = player1Data.elo_rating + changes.player1Change
      const player2NewRating = player2Data.elo_rating + changes.player2Change

      // Update ratings in database
      const { error: update1Error } = await supabase
        .from('users')
        .update({ elo_rating: player1NewRating })
        .eq('id', player1Id)

      const { error: update2Error } = await supabase
        .from('users')
        .update({ elo_rating: player2NewRating })
        .eq('id', player2Id)

      if (update1Error || update2Error) {
        console.error('Error updating ELO ratings:', update1Error || update2Error)
        return null
      }

      return {
        player1NewRating,
        player2NewRating,
        player1Change: changes.player1Change,
        player2Change: changes.player2Change
      }
    } catch (error) {
      console.error('Error updating ELO ratings:', error)
      return null
    }
  }

  /**
   * Record match history
   */
  static async recordMatchHistory(
    gameSessionId: string,
    player1Id: string,
    player2Id: string,
    player1Score: number,
    player2Score: number,
    player1EloBefore: number,
    player1EloAfter: number,
    player2EloBefore: number,
    player2EloAfter: number,
    winnerId: string | null
  ): Promise<boolean> {
    // TODO: Implement match_history table
    // For now, match history recording is not implemented
    console.log('Match history recording not implemented:', {
      gameSessionId,
      player1Id,
      player2Id,
      player1Score,
      player2Score,
      player1EloBefore,
      player1EloAfter,
      player2EloBefore,
      player2EloAfter,
      winnerId
    })
    return true
  }

  /**
   * Get ELO tier for a rating
   */
  static getEloTier(rating: number): {
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

  /**
   * Get ELO change display text
   */
  static getEloChangeText(change: number): string {
    if (change > 0) {
      return `+${change}`
    } else if (change < 0) {
      return change.toString()
    } else {
      return '0'
    }
  }

  /**
   * Get ELO change color class
   */
  static getEloChangeColor(change: number): string {
    if (change > 0) {
      return 'text-green-600'
    } else if (change < 0) {
      return 'text-red-600'
    } else {
      return 'text-gray-600'
    }
  }
}
