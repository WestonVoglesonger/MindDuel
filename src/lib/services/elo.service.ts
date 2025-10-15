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
    const supabase = createClient()

    try {
      // Call the database function to update ELO ratings
      const { data, error } = await supabase.rpc('update_elo_ratings', {
        p_player1_id: player1Id,
        p_player2_id: player2Id,
        p_winner_id: winnerId
      })

      if (error) {
        console.error('Error updating ELO ratings:', error)
        return null
      }

      return data?.[0] || null
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
    const supabase = createClient()

    const { error } = await supabase
      .from('match_history')
      .insert({
        game_session_id: gameSessionId,
        player1_id: player1Id,
        player2_id: player2Id,
        player1_score: player1Score,
        player2_score: player2Score,
        player1_elo_before: player1EloBefore,
        player1_elo_after: player1EloAfter,
        player2_elo_before: player2EloBefore,
        player2_elo_after: player2EloAfter,
        winner_id: winnerId
      })

    if (error) {
      console.error('Error recording match history:', error)
      return false
    }

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
