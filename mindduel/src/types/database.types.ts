// Database types (will be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          elo_rating: number
          games_played: number
          games_won: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          elo_rating?: number
          games_played?: number
          games_won?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          elo_rating?: number
          games_played?: number
          games_won?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          category_id: string
          question_text: string
          correct_answer: string
          answer_variants: string[]
          point_value: number
          difficulty: 'easy' | 'medium' | 'hard'
          air_date: string | null
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          question_text: string
          correct_answer: string
          answer_variants: string[]
          point_value: number
          difficulty: 'easy' | 'medium' | 'hard'
          air_date?: string | null
          source: string
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          question_text?: string
          correct_answer?: string
          answer_variants?: string[]
          point_value?: number
          difficulty?: 'easy' | 'medium' | 'hard'
          air_date?: string | null
          source?: string
          created_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          player1_id: string
          player2_id: string
          status: 'waiting' | 'in_progress' | 'completed' | 'abandoned'
          player1_score: number
          player2_score: number
          current_turn_player_id: string | null
          board_state: any
          winner_id: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          player1_id: string
          player2_id: string
          status?: 'waiting' | 'in_progress' | 'completed' | 'abandoned'
          player1_score?: number
          player2_score?: number
          current_turn_player_id?: string | null
          board_state?: any
          winner_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          player1_id?: string
          player2_id?: string
          status?: 'waiting' | 'in_progress' | 'completed' | 'abandoned'
          player1_score?: number
          player2_score?: number
          current_turn_player_id?: string | null
          board_state?: any
          winner_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      game_questions: {
        Row: {
          id: string
          game_session_id: string
          question_id: string
          position: number
          answered_by: string | null
          is_correct: boolean | null
          answered_at: string | null
        }
        Insert: {
          id?: string
          game_session_id: string
          question_id: string
          position: number
          answered_by?: string | null
          is_correct?: boolean | null
          answered_at?: string | null
        }
        Update: {
          id?: string
          game_session_id?: string
          question_id?: string
          position?: number
          answered_by?: string | null
          is_correct?: boolean | null
          answered_at?: string | null
        }
      }
      buzzer_events: {
        Row: {
          id: string
          game_session_id: string
          question_id: string
          player_id: string
          buzz_timestamp: string
          server_timestamp: string
          was_first: boolean | null
        }
        Insert: {
          id?: string
          game_session_id: string
          question_id: string
          player_id: string
          buzz_timestamp: string
          server_timestamp?: string
          was_first?: boolean | null
        }
        Update: {
          id?: string
          game_session_id?: string
          question_id?: string
          player_id?: string
          buzz_timestamp?: string
          server_timestamp?: string
          was_first?: boolean | null
        }
      }
      match_history: {
        Row: {
          id: string
          game_session_id: string
          player1_id: string
          player2_id: string
          player1_score: number
          player2_score: number
          player1_elo_before: number
          player1_elo_after: number
          player2_elo_before: number
          player2_elo_after: number
          winner_id: string | null
          completed_at: string
        }
        Insert: {
          id?: string
          game_session_id: string
          player1_id: string
          player2_id: string
          player1_score: number
          player2_score: number
          player1_elo_before: number
          player1_elo_after: number
          player2_elo_before: number
          player2_elo_after: number
          winner_id?: string | null
          completed_at?: string
        }
        Update: {
          id?: string
          game_session_id?: string
          player1_id?: string
          player2_id?: string
          player1_score?: number
          player2_score?: number
          player1_elo_before?: number
          player1_elo_after?: number
          player2_elo_before?: number
          player2_elo_after?: number
          winner_id?: string | null
          completed_at?: string
        }
      }
      matchmaking_queue: {
        Row: {
          id: string
          user_id: string
          elo_rating: number
          joined_at: string
          status: 'waiting' | 'matched' | 'cancelled'
        }
        Insert: {
          id?: string
          user_id: string
          elo_rating: number
          joined_at?: string
          status?: 'waiting' | 'matched' | 'cancelled'
        }
        Update: {
          id?: string
          user_id?: string
          elo_rating?: number
          joined_at?: string
          status?: 'waiting' | 'matched' | 'cancelled'
        }
      }
    }
  }
}
