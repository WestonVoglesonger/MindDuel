import { Tables } from './database.types'

export type Player = Tables<'users'>
export type Category = Tables<'categories'>
export type Question = Tables<'questions'>
export type GameSession = Tables<'game_sessions'>
export type MatchmakingQueue = Tables<'matchmaking_queue'>

export type GameState = {
  id: string
  player1: Player
  player2: Player | null
  player1_score: number
  player2_score: number
  current_round: string
  current_question: Question | null
  board: GameBoard
  status: 'waiting_for_players' | 'in_progress' | 'completed' | 'cancelled'
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