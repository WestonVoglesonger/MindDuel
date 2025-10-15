import { createClient } from '@/lib/supabase/server'
import { GameSession, GameSessionInsert, GameQuestion, BuzzerEvent, BuzzerEventInsert } from '@/types/game.types'

/**
 * Create a new game session
 */
export async function createGameSession(player1Id: string, player2Id: string): Promise<GameSession | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({
      player1_id: player1Id,
      player2_id: player2Id,
      status: 'waiting',
      current_turn_player_id: player1Id, // Player 1 goes first
      board_state: {
        selectedQuestions: [],
        answeredQuestions: [],
        currentPlayerTurn: player1Id
      }
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating game session:', error)
    return null
  }

  return data
}

/**
 * Get game session by ID
 */
export async function getGameSession(gameSessionId: string): Promise<GameSession | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', gameSessionId)
    .single()

  if (error) {
    console.error('Error fetching game session:', error)
    return null
  }

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

  // Insert game questions with positions
  const gameQuestions: GameQuestion[] = []
  
  for (let i = 0; i < 25; i++) {
    const { data: gameQuestion, error } = await supabase
      .from('game_questions')
      .insert({
        game_session_id: gameSessionId,
        question_id: questions[i].id,
        position: i
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating game question:', error)
      continue
    }

    if (gameQuestion) {
      gameQuestions.push(gameQuestion)
    }
  }

  return gameQuestions
}

/**
 * Get questions for a game session
 */
export async function getGameQuestions(gameSessionId: string): Promise<GameQuestion[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('game_questions')
    .select(`
      *,
      question:questions(*)
    `)
    .eq('game_session_id', gameSessionId)
    .order('position')

  if (error) {
    console.error('Error fetching game questions:', error)
    return []
  }

  return data || []
}

/**
 * Record a buzzer event
 */
export async function recordBuzzerEvent(buzzerData: BuzzerEventInsert): Promise<BuzzerEvent | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('buzzer_events')
    .insert(buzzerData)
    .select()
    .single()

  if (error) {
    console.error('Error recording buzzer event:', error)
    return null
  }

  return data
}

/**
 * Get buzzer events for a question
 */
export async function getBuzzerEvents(gameSessionId: string, questionId: string): Promise<BuzzerEvent[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('buzzer_events')
    .select('*')
    .eq('game_session_id', gameSessionId)
    .eq('question_id', questionId)
    .order('server_timestamp')

  if (error) {
    console.error('Error fetching buzzer events:', error)
    return []
  }

  return data || []
}

/**
 * Determine who buzzed first for a question
 */
export async function determineBuzzerWinner(gameSessionId: string, questionId: string): Promise<string | null> {
  const buzzerEvents = await getBuzzerEvents(gameSessionId, questionId)
  
  if (buzzerEvents.length === 0) {
    return null
  }

  // Sort by server timestamp to determine winner
  const sortedEvents = buzzerEvents.sort((a, b) => 
    new Date(a.server_timestamp).getTime() - new Date(b.server_timestamp).getTime()
  )

  const winner = sortedEvents[0]
  
  // Update all buzzer events to mark the winner
  const supabase = createClient()
  await supabase
    .from('buzzer_events')
    .update({ was_first: false })
    .eq('game_session_id', gameSessionId)
    .eq('question_id', questionId)

  await supabase
    .from('buzzer_events')
    .update({ was_first: true })
    .eq('id', winner.id)

  return winner.player_id
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
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('game_questions')
    .update({
      answered_by: playerId,
      is_correct: isCorrect,
      answered_at: new Date().toISOString()
    })
    .eq('game_session_id', gameSessionId)
    .eq('question_id', questionId)
    .select()
    .single()

  if (error) {
    console.error('Error submitting answer:', error)
    return null
  }

  return data
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
      status: 'abandoned',
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
