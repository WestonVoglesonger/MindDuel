import { GAME_CONFIG } from '@/constants/game-config'

const K_FACTOR = GAME_CONFIG.ELO.K_FACTOR

/**
 * Calculates the expected score of player A against player B.
 * @param ratingA Player A's ELO rating.
 * @param ratingB Player B's ELO rating.
 * @returns The expected score for player A (between 0 and 1).
 */
export function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

/**
 * Calculates the new ELO ratings for two players after a game.
 * @param ratingA Player A's current ELO rating.
 * @param ratingB Player B's current ELO rating.
 * @param scoreA Actual score for player A (1 for win, 0.5 for draw, 0 for loss).
 * @param scoreB Actual score for player B (1 for win, 0.5 for draw, 0 for loss).
 * @returns An object containing the new ratings for player A and player B.
 */
export function calculateNewRatings(
  ratingA: number,
  ratingB: number,
  scoreA: number,
  scoreB: number
): { newRatingA: number; newRatingB: number } {
  const expectedA = calculateExpectedScore(ratingA, ratingB)
  const expectedB = calculateExpectedScore(ratingB, ratingA)

  const newRatingA = ratingA + K_FACTOR * (scoreA - expectedA)
  const newRatingB = ratingB + K_FACTOR * (scoreB - expectedB)

  return {
    newRatingA: Math.round(newRatingA),
    newRatingB: Math.round(newRatingB),
  }
}