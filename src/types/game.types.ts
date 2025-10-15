import { Tables } from './database.types'
import { AnswerValidationResult } from '@/lib/utils/answer-matcher'

export type Player = {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  eloRating: number
  gamesPlayed: number
  gamesWon: number
  isOnline: boolean
}
export type Category = Tables<'categories'>
export type Question = Tables<'questions'>
export type GameSession = Tables<'game_sessions'>
export type MatchmakingQueue = Tables<'matchmaking_queue'>

// Re-export for convenience
export type { AnswerValidationResult }

export type GameState = {
  id: string
  player1: Player
  player2: Player | null
  player1_score: number
  player2_score: number
  current_round: string
  current_question: Question | null
  board: GameBoard
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
  turn_player_id: string | null
  buzzer_open: boolean
  buzzed_player_id: string | null
  answer_timer_start: string | null
  question_timer_start: string | null
  answered_correctly: boolean | null
  last_buzzer_time: string | null
  // Add any other relevant game state properties
}

export type GameBoard = {
  [categoryId: string]: {
    category: Category
    questions: {
      [value: number]: Question | null
    }
  }
}

export type BuzzerState = {
  buzzed: boolean
  timestamp: number | null
  player_id: string | null
}

export type GameUpdatePayload = {
  eventType: 'game_state_update' | 'buzzer_event' | 'player_joined' | 'game_start' | 'game_end'
  payload: Partial<GameState> | BuzzerState | { playerId: string; username: string }
}

// Additional types for game service
export type GameQuestion = {
  id: string
  game_session_id: string
  question_id: string
  position: number
  answered_by: string | null
  is_correct: boolean | null
  answered_at: string | null
  question: Question
}

export type BuzzerEvent = {
  id: string
  game_session_id: string
  question_id: string
  player_id: string
  buzz_timestamp: string
  server_timestamp: string
  was_first: boolean | null
}

export type BuzzerEventInsert = {
  game_session_id: string
  question_id: string
  player_id: string
  buzz_timestamp?: string
}

export type PlayerInGame = {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  score: number
  eloRating: number
  isCurrentPlayer: boolean
}

export type GameResult = {
  winner: PlayerInGame | null
  finalScores: {
    player1: number
    player2: number
  }
  eloChanges: {
    player1: number
    player2: number
  }
}
