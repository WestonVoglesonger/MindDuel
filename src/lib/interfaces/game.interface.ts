import { GameSession, GameQuestion, BuzzerEvent, PlayerInGame, GameResult } from '@/types/game.types'

export interface GameServiceInterface {
  /**
   * Initialize a new game between two players
   */
  initializeGame(player1Id: string, player2Id: string): Promise<GameSession | null>

  /**
   * Get game session by ID
   */
  getGameSession(gameSessionId: string): Promise<GameSession | null>

  /**
   * Start a game (change status from waiting to in_progress)
   */
  startGame(gameSessionId: string): Promise<GameSession | null>

  /**
   * Handle buzzer press from a player
   */
  handleBuzzerPress(gameSessionId: string, questionId: string, playerId: string): Promise<BuzzerEvent | null>

  /**
   * Submit an answer for a question
   */
  submitAnswer(gameSessionId: string, questionId: string, playerId: string, answer: string): Promise<{
    isCorrect: boolean
    scoreChange: number
    gameSession: GameSession | null
  }>

  /**
   * Update game state (board state, current turn, etc.)
   */
  updateGameState(gameSessionId: string, updates: Partial<GameSession>): Promise<GameSession | null>

  /**
   * Complete a game and determine winner
   */
  completeGame(gameSessionId: string): Promise<GameResult | null>

  /**
   * Abandon a game
   */
  abandonGame(gameSessionId: string, abandoningPlayerId: string): Promise<GameSession | null>

  /**
   * Get active game for a user
   */
  getActiveGameForUser(userId: string): Promise<GameSession | null>

  /**
   * Get game questions with full question data
   */
  getGameQuestions(gameSessionId: string): Promise<GameQuestion[]>

  /**
   * Select a question for the current turn
   */
  selectQuestion(gameSessionId: string, questionId: string, playerId: string): Promise<GameSession | null>
}
