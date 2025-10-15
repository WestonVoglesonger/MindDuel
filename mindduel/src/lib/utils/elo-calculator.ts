import { GAME_CONFIG } from '@/constants/game-config'

/**
 * Calculate the expected score for a player based on ELO ratings
 * @param playerRating - The player's current ELO rating
 * @param opponentRating - The opponent's ELO rating
 * @returns Expected score (0-1)
 */
export function calculateExpectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400))
}

/**
 * Calculate new ELO rating based on actual vs expected performance
 * @param currentRating - Current ELO rating
 * @param expectedScore - Expected score (0-1)
 * @param actualScore - Actual score (0 for loss, 0.5 for draw, 1 for win)
 * @param kFactor - K-factor for rating volatility
 * @returns New ELO rating
 */
export function calculateNewRating(
  currentRating: number,
  expectedScore: number,
  actualScore: number,
  kFactor: number
): number {
  const ratingChange = Math.round(kFactor * (actualScore - expectedScore))
  return Math.max(0, currentRating + ratingChange)
}

/**
 * Determine K-factor based on number of games played
 * @param gamesPlayed - Number of games the player has played
 * @returns K-factor for ELO calculation
 */
export function getKFactor(gamesPlayed: number): number {
  if (gamesPlayed < 30) {
    return GAME_CONFIG.K_FACTOR_NOVICE
  } else if (gamesPlayed < 100) {
    return GAME_CONFIG.K_FACTOR_INTERMEDIATE
  } else {
    return GAME_CONFIG.K_FACTOR_VETERAN
  }
}

/**
 * Calculate ELO rating changes for both players after a game
 * @param player1Rating - Player 1's current ELO rating
 * @param player2Rating - Player 2's current ELO rating
 * @param player1GamesPlayed - Player 1's total games played
 * @param player2GamesPlayed - Player 2's total games played
 * @param winnerId - ID of the winning player (null for draw)
 * @param player1Id - Player 1's ID
 * @param player2Id - Player 2's ID
 * @returns Object with new ratings and changes for both players
 */
export function calculateEloChanges(
  player1Rating: number,
  player2Rating: number,
  player1GamesPlayed: number,
  player2GamesPlayed: number,
  winnerId: string | null,
  player1Id: string,
  player2Id: string
) {
  // Determine actual scores
  let player1Score: number
  let player2Score: number

  if (winnerId === player1Id) {
    player1Score = 1
    player2Score = 0
  } else if (winnerId === player2Id) {
    player1Score = 0
    player2Score = 1
  } else {
    // Draw
    player1Score = 0.5
    player2Score = 0.5
  }

  // Calculate expected scores
  const player1Expected = calculateExpectedScore(player1Rating, player2Rating)
  const player2Expected = calculateExpectedScore(player2Rating, player1Rating)

  // Get K-factors
  const player1KFactor = getKFactor(player1GamesPlayed)
  const player2KFactor = getKFactor(player2GamesPlayed)

  // Calculate new ratings
  const player1NewRating = calculateNewRating(player1Rating, player1Expected, player1Score, player1KFactor)
  const player2NewRating = calculateNewRating(player2Rating, player2Expected, player2Score, player2KFactor)

  // Calculate changes
  const player1Change = player1NewRating - player1Rating
  const player2Change = player2NewRating - player2Rating

  return {
    player1NewRating,
    player2NewRating,
    player1Change,
    player2Change,
  }
}

/**
 * Get ELO tier information based on rating
 * @param rating - ELO rating
 * @returns Tier information
 */
export function getEloTier(rating: number) {
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
