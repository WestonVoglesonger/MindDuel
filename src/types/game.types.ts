import { Database } from './database.types'

// Type aliases for easier use
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type Question = Database['public']['Tables']['questions']['Row']
export type QuestionInsert = Database['public']['Tables']['questions']['Insert']
export type QuestionUpdate = Database['public']['Tables']['questions']['Update']

export type GameSession = Database['public']['Tables']['game_sessions']['Row']
export type GameSessionInsert = Database['public']['Tables']['game_sessions']['Insert']
export type GameSessionUpdate = Database['public']['Tables']['game_sessions']['Update']

export type GameQuestion = Database['public']['Tables']['game_questions']['Row']
export type GameQuestionInsert = Database['public']['Tables']['game_questions']['Insert']
export type GameQuestionUpdate = Database['public']['Tables']['game_questions']['Update']

export type BuzzerEvent = Database['public']['Tables']['buzzer_events']['Row']
export type BuzzerEventInsert = Database['public']['Tables']['buzzer_events']['Insert']
export type BuzzerEventUpdate = Database['public']['Tables']['buzzer_events']['Update']

export type MatchHistory = Database['public']['Tables']['match_history']['Row']
export type MatchHistoryInsert = Database['public']['Tables']['match_history']['Insert']
export type MatchHistoryUpdate = Database['public']['Tables']['match_history']['Update']

export type MatchmakingQueue = Database['public']['Tables']['matchmaking_queue']['Row']
export type MatchmakingQueueInsert = Database['public']['Tables']['matchmaking_queue']['Insert']
export type MatchmakingQueueUpdate = Database['public']['Tables']['matchmaking_queue']['Update']

// Game-specific types
export interface GameState {
  currentQuestion: Question | null
  selectedPosition: number | null
  buzzerEnabled: boolean
  buzzerWinner: string | null
  answerSubmitted: boolean
  timeRemaining: number
  gamePhase: 'waiting' | 'question_reveal' | 'buzzer_active' | 'answering' | 'scoring' | 'completed'
}

export interface BoardState {
  selectedQuestions: Set<number>
  answeredQuestions: Set<number>
  currentPlayerTurn: string
}

export interface PlayerInGame {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  score: number
  eloRating: number
  isCurrentPlayer: boolean
}

export interface GameResult {
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

// Answer validation types
export interface AnswerValidationResult {
  isCorrect: boolean
  confidence: number
  normalizedAnswer: string
  normalizedCorrect: string
}

// ELO calculation types
export interface EloCalculation {
  player1NewRating: number
  player2NewRating: number
  player1Change: number
  player2Change: number
}

// Matchmaking types
export interface MatchmakingStatus {
  status: 'idle' | 'searching' | 'found' | 'error'
  eloRange: number
  timeElapsed: number
  estimatedWaitTime: number
}
