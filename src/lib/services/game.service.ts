import { GameServiceInterface } from '@/lib/interfaces/game.interface'
import { GameSession, GameQuestion, BuzzerEvent, PlayerInGame, GameResult } from '@/types/game.types'
import * as gameDb from '@/lib/db/game.db'
import * as userDb from '@/lib/db/user.db'
import { AnswerValidationService } from '@/lib/services/answer-validation.service'
import { EloService } from '@/lib/services/elo.service'
import { GAME_CONFIG } from '@/constants/game-config'

export class GameService implements GameServiceInterface {
  async initializeGame(player1Id: string, player2Id: string): Promise<GameSession | null> {
    try {
      // Create game session
      const gameSession = await gameDb.createGameSession(player1Id, player2Id)
      if (!gameSession) {
        return null
      }

      // Select questions for the game
      const questions = await gameDb.selectQuestionsForGame(gameSession.id)
      if (questions.length < GAME_CONFIG.TOTAL_QUESTIONS) {
        console.error('Not enough questions selected for game')
        return null
      }

      return gameSession
    } catch (error) {
      console.error('Error initializing game:', error)
      return null
    }
  }

  async getGameSession(gameSessionId: string): Promise<GameSession | null> {
    try {
      return await gameDb.getGameSession(gameSessionId)
    } catch (error) {
      console.error('Error getting game session:', error)
      return null
    }
  }

  async startGame(gameSessionId: string): Promise<GameSession | null> {
    try {
      return await gameDb.updateGameSession(gameSessionId, {
        status: 'in_progress'
      })
    } catch (error) {
      console.error('Error starting game:', error)
      return null
    }
  }

  async handleBuzzerPress(gameSessionId: string, questionId: string, playerId: string): Promise<BuzzerEvent | null> {
    try {
      // Validate buzzer timing
      const isValid = await this.validateBuzzerTiming(gameSessionId, questionId, playerId)
      if (!isValid) {
        return null
      }

      // Record buzzer event
      const buzzerEvent = await gameDb.recordBuzzerEvent({
        game_session_id: gameSessionId,
        question_id: questionId,
        player_id: playerId,
        buzz_timestamp: new Date().toISOString()
      })

      if (buzzerEvent) {
        // Determine buzzer winner
        const winnerId = await gameDb.determineBuzzerWinner(gameSessionId, questionId)
        return buzzerEvent
      }

      return null
    } catch (error) {
      console.error('Error handling buzzer press:', error)
      return null
    }
  }

  async submitAnswer(gameSessionId: string, questionId: string, playerId: string, answer: string): Promise<{
    isCorrect: boolean
    scoreChange: number
    gameSession: GameSession | null
  }> {
    try {
      // Get game session
      const gameSession = await this.getGameSession(gameSessionId)
      if (!gameSession) {
        throw new Error('Game session not found')
      }

      // Get question details
      const gameQuestions = await this.getGameQuestions(gameSessionId)
      const gameQuestion = gameQuestions.find(gq => gq.question_id === questionId)
      
      if (!gameQuestion) {
        throw new Error('Question not found in game')
      }

      // Validate answer
      const validation = AnswerValidationService.validateAnswerComprehensive(
        answer,
        gameQuestion.question.correct_answer,
        gameQuestion.question.answer_variants
      )

      if (!validation.isValid) {
        throw new Error(validation.message)
      }

      // Calculate score change
      const scoreChange = validation.isCorrect ? gameQuestion.question.point_value : -gameQuestion.question.point_value

      // Submit answer
      await gameDb.submitAnswer(gameSessionId, questionId, playerId, answer, validation.isCorrect)

      // Update score
      const updatedGameSession = await gameDb.updateScore(gameSessionId, playerId, scoreChange)

      return {
        isCorrect: validation.isCorrect,
        scoreChange,
        gameSession: updatedGameSession
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      return {
        isCorrect: false,
        scoreChange: 0,
        gameSession: null
      }
    }
  }

  async updateGameState(gameSessionId: string, updates: Partial<GameSession>): Promise<GameSession | null> {
    try {
      return await gameDb.updateGameSession(gameSessionId, updates)
    } catch (error) {
      console.error('Error updating game state:', error)
      return null
    }
  }

  async completeGame(gameSessionId: string): Promise<GameResult | null> {
    try {
      const gameSession = await this.getGameSession(gameSessionId)
      if (!gameSession) {
        return null
      }

      // Determine winner
      const winnerId = gameSession.player1_score > gameSession.player2_score 
        ? gameSession.player1_id 
        : gameSession.player2_score > gameSession.player1_score 
          ? gameSession.player2_id 
          : null

      // Complete the game
      const completedGame = await gameDb.completeGame(gameSessionId, winnerId)
      if (!completedGame) {
        return null
      }

      // Update ELO ratings
      const eloResult = await EloService.updateRatingsAfterGame(
        gameSession.player1_id,
        gameSession.player2_id,
        winnerId
      )

      if (eloResult) {
        // Record match history
        await EloService.recordMatchHistory(
          gameSessionId,
          gameSession.player1_id,
          gameSession.player2_id,
          gameSession.player1_score,
          gameSession.player2_score,
          gameSession.player1_id === winnerId ? eloResult.player1NewRating - eloResult.player1Change : eloResult.player1NewRating - eloResult.player1Change,
          eloResult.player1NewRating,
          gameSession.player2_id === winnerId ? eloResult.player2NewRating - eloResult.player2Change : eloResult.player2NewRating - eloResult.player2Change,
          eloResult.player2NewRating,
          winnerId
        )
      }

      // Get player information
      const player1 = await userDb.getUserById(gameSession.player1_id)
      const player2 = await userDb.getUserById(gameSession.player2_id)

      if (!player1 || !player2) {
        return null
      }

      const player1InGame: PlayerInGame = {
        id: player1.id,
        username: player1.username,
        displayName: player1.display_name || player1.username,
        avatarUrl: player1.avatar_url,
        score: gameSession.player1_score,
        eloRating: player1.elo_rating,
        isCurrentPlayer: false
      }

      const player2InGame: PlayerInGame = {
        id: player2.id,
        username: player2.username,
        displayName: player2.display_name || player2.username,
        avatarUrl: player2.avatar_url,
        score: gameSession.player2_score,
        eloRating: player2.elo_rating,
        isCurrentPlayer: false
      }

      const winner = winnerId ? (winnerId === player1.id ? player1InGame : player2InGame) : null

      return {
        winner,
        finalScores: {
          player1: gameSession.player1_score,
          player2: gameSession.player2_score
        },
        eloChanges: eloResult ? {
          player1: eloResult.player1Change,
          player2: eloResult.player2Change
        } : { player1: 0, player2: 0 }
      }
    } catch (error) {
      console.error('Error completing game:', error)
      return null
    }
  }

  async abandonGame(gameSessionId: string, abandoningPlayerId: string): Promise<GameSession | null> {
    try {
      const gameSession = await this.getGameSession(gameSessionId)
      if (!gameSession) {
        return null
      }

      // Determine winner (the player who didn't abandon)
      const winnerId = abandoningPlayerId === gameSession.player1_id 
        ? gameSession.player2_id 
        : gameSession.player1_id

      // Complete the game with the non-abandoning player as winner
      return await gameDb.completeGame(gameSessionId, winnerId)
    } catch (error) {
      console.error('Error abandoning game:', error)
      return null
    }
  }

  async getActiveGameForUser(userId: string): Promise<GameSession | null> {
    try {
      return await gameDb.getActiveGameForUser(userId)
    } catch (error) {
      console.error('Error getting active game for user:', error)
      return null
    }
  }

  async getGameQuestions(gameSessionId: string): Promise<any[]> {
    try {
      return await gameDb.getGameQuestions(gameSessionId)
    } catch (error) {
      console.error('Error getting game questions:', error)
      return []
    }
  }

  async selectQuestion(gameSessionId: string, questionId: string, playerId: string): Promise<GameSession | null> {
    try {
      const gameSession = await this.getGameSession(gameSessionId)
      if (!gameSession) {
        return null
      }

      // Check if it's the player's turn
      if (gameSession.current_turn_player_id !== playerId) {
        throw new Error('Not your turn')
      }

      // Update board state to mark question as selected
      const boardState = gameSession.board_state as any
      const selectedQuestions = new Set(boardState.selectedQuestions || [])
      
      // Find question position
      const gameQuestions = await this.getGameQuestions(gameSessionId)
      const gameQuestion = gameQuestions.find(gq => gq.question_id === questionId)
      
      if (!gameQuestion) {
        throw new Error('Question not found in game')
      }

      selectedQuestions.add(gameQuestion.position)

      // Update game state
      return await this.updateGameState(gameSessionId, {
        board_state: {
          ...boardState,
          selectedQuestions: Array.from(selectedQuestions)
        }
      })
    } catch (error) {
      console.error('Error selecting question:', error)
      return null
    }
  }

  /**
   * Validate buzzer timing
   */
  private async validateBuzzerTiming(gameSessionId: string, questionId: string, playerId: string): Promise<boolean> {
    try {
      // Check if game is in progress
      const gameSession = await this.getGameSession(gameSessionId)
      if (!gameSession || gameSession.status !== 'in_progress') {
        return false
      }

      // Check if question exists in game
      const gameQuestions = await this.getGameQuestions(gameSessionId)
      const gameQuestion = gameQuestions.find(gq => gq.question_id === questionId)
      
      if (!gameQuestion) {
        return false
      }

      // Check if player has already buzzed for this question
      const buzzerEvents = await gameDb.getBuzzerEvents(gameSessionId, questionId)
      const hasBuzzed = buzzerEvents.some(event => event.player_id === playerId)
      
      if (hasBuzzed) {
        return false
      }

      return true
    } catch (error) {
      console.error('Error validating buzzer timing:', error)
      return false
    }
  }
}
