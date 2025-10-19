import { createClient } from '@/lib/supabase/client'
import { GameSession, GameQuestion, BuzzerEvent, BuzzerEventInsert } from '@/types/game.types'

type CreateGameSessionOptions = {
  status?: GameSession['status']
  boardState?: Record<string, unknown>
  isBotMatch?: boolean
}

/**
 * Create a new game session
 */
export async function createGameSession(
  player1Id: string,
  player2Id: string,
  options: CreateGameSessionOptions = {}
): Promise<GameSession | null> {
  console.log('🎮 createGameSession called:', { player1Id, player2Id, options })
  const supabase = createClient()

  const baseBoardState: Record<string, unknown> = {
    selectedQuestions: [],
    answeredQuestions: [],
    currentPlayerTurn: player1Id,
  }

  const providedBoardState = options.boardState ?? {}
  const mergedBoardState = {
    ...baseBoardState,
    ...providedBoardState,
  }

  const metaKey = 'meta'
  const existingMeta =
    typeof (mergedBoardState as Record<string, unknown>)[metaKey] === 'object' &&
    (mergedBoardState as Record<string, unknown>)[metaKey] !== null
      ? ((mergedBoardState as Record<string, unknown>)[metaKey] as Record<string, unknown>)
      : {}

  ;(mergedBoardState as Record<string, unknown>)[metaKey] = {
    ...existingMeta,
    isBotMatch: options.isBotMatch ?? false,
  }

  const insertData = {
    player1_id: player1Id,
    player2_id: player2Id,
    status: options.status ?? 'waiting',
    current_turn_player_id: player1Id, // Player 1 goes first
    board_state: mergedBoardState
  }

  console.log('🎮 Inserting game session with data:', insertData)

  const { data, error } = await supabase
    .from('game_sessions')
    .insert(insertData)
    .select()
    .single()

  console.log('🎮 Game session insert result:', { data, error })

  if (error) {
    console.error('❌ Error creating game session:', error)
    return null
  }

  console.log('✅ Game session created successfully:', data)
  return data
}

/**
 * Get game session by ID
 */
export async function getGameSession(gameSessionId: string): Promise<GameSession | null> {
  console.log('🔍 getGameSession called with ID:', gameSessionId)
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', gameSessionId)
    .single()

  console.log('🔍 getGameSession result:', { data, error })

  if (error) {
    console.error('❌ Error fetching game session:', error)
    return null
  }

  console.log('✅ Game session found:', data)
  return data
}

/**
 * Update game session
 */
export async function updateGameSession(gameSessionId: string, updates: Partial<GameSession>): Promise<GameSession | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('game_sessions')
    .update(updates)
    .eq('id', gameSessionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating game session:', error)
    return null
  }

  return data
}

/**
 * Select questions for a game (25 questions for 5x5 board)
 */
export async function selectQuestionsForGame(gameSessionId: string): Promise<GameQuestion[]> {
  const supabase = createClient()
  
  // First, get 25 random questions
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .order('random()')
    .limit(25)

  if (questionsError) {
    console.error('Error fetching questions for game:', questionsError)
    return []
  }

  if (!questions || questions.length < 25) {
    console.error('Not enough questions available for game')
    return []
  }

  // TODO: Implement game_questions table or use board_state approach
  // For now, return empty array since game_questions table doesn't exist
  return []
}

/**
 * Get questions for a game session
 */
export async function getGameQuestions(_gameSessionId: string): Promise<GameQuestion[]> {
  // TODO: Implement game_questions table or use board_state approach
  // For now, return empty array since game_questions table doesn't exist
  return []
}

/**
 * Record a buzzer event
 */
export async function recordBuzzerEvent(buzzerData: BuzzerEventInsert): Promise<BuzzerEvent | null> {
  // TODO: Implement buzzer_events table
  // For now, return null since buzzer_events table doesn't exist
  console.log('Buzzer event recording not implemented:', buzzerData)
  return null
}

/**
 * Get buzzer events for a question
 */
export async function getBuzzerEvents(gameSessionId: string, questionId: string): Promise<BuzzerEvent[]> {
  // TODO: Implement buzzer_events table
  // For now, return empty array since buzzer_events table doesn't exist
  return []
}

/**
 * Determine who buzzed first for a question
 */
export async function determineBuzzerWinner(gameSessionId: string, questionId: string): Promise<string | null> {
  // TODO: Implement buzzer_events table
  // For now, return null since buzzer_events table doesn't exist
  return null
}

/**
 * Submit an answer for a question
 */
export async function submitAnswer(
  gameSessionId: string,
  questionId: string,
  playerId: string,
  answer: string,
  isCorrect: boolean
): Promise<GameQuestion | null> {
  // TODO: Implement game_questions table or use board_state approach
  // For now, return null since game_questions table doesn't exist
  console.log('Answer submission not implemented:', { gameSessionId, questionId, playerId, answer, isCorrect })
  return null
}

/**
 * Update player score
 */
export async function updateScore(gameSessionId: string, playerId: string, scoreDelta: number): Promise<GameSession | null> {
  const supabase = createClient()
  
  // Get current game session
  const gameSession = await getGameSession(gameSessionId)
  if (!gameSession) {
    return null
  }

  // Determine which player and update their score
  const isPlayer1 = gameSession.player1_id === playerId
  const newScore = isPlayer1 
    ? gameSession.player1_score + scoreDelta
    : gameSession.player2_score + scoreDelta

  const updates: Partial<GameSession> = isPlayer1
    ? { player1_score: newScore }
    : { player2_score: newScore }

  return await updateGameSession(gameSessionId, updates)
}

/**
 * Complete a game
 */
export async function completeGame(gameSessionId: string, winnerId: string | null): Promise<GameSession | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('game_sessions')
    .update({
      status: 'completed',
      winner_id: winnerId,
      completed_at: new Date().toISOString()
    })
    .eq('id', gameSessionId)
    .select()
    .single()

  if (error) {
    console.error('Error completing game:', error)
    return null
  }

  return data
}

/**
 * Get active game for a user
 */
export async function getActiveGameForUser(userId: string): Promise<GameSession | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
    .in('status', ['waiting', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No active game found
      return null
    }
    console.error('Error fetching active game:', error)
    return null
  }

  return data
}

/**
 * Abandon a game
 */
export async function abandonGame(gameSessionId: string): Promise<GameSession | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('game_sessions')
    .update({
      status: 'cancelled',
      completed_at: new Date().toISOString()
    })
    .eq('id', gameSessionId)
    .select()
    .single()

  if (error) {
    console.error('Error abandoning game:', error)
    return null
  }

  return data
}
