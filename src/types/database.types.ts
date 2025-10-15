export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          current_question_id: string | null
          current_round: string
          id: string
          player1_id: string
          player1_score: number
          player2_id: string | null
          player2_score: number
          state: Json
          status: Database['public']['Enums']['game_status']
          current_turn_player_id: string | null
          winner_id: string | null
          updated_at: string
        }
        Insert: {
          current_question_id?: string | null
          current_round?: string
          id?: string
          player1_id: string
          player1_score?: number
          player2_id?: string | null
          player2_score?: number
          state?: Json
          status?: Database['public']['Enums']['game_status']
          current_turn_player_id?: string | null
          winner_id?: string | null
          updated_at?: string
        }
        Update: {
          current_question_id?: string | null
          current_round?: string
          id?: string
          player1_id?: string
          player1_score?: number
          player2_id?: string | null
          player2_score?: number
          state?: Json
          status?: Database['public']['Enums']['game_status']
          current_turn_player_id?: string | null
          winner_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'game_sessions_current_question_id_fkey'
            columns: ['current_question_id']
            isOneToOne: false
            referencedRelation: 'questions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'game_sessions_player1_id_fkey'
            columns: ['player1_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'game_sessions_player2_id_fkey'
            columns: ['player2_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'game_sessions_current_turn_player_id_fkey'
            columns: ['current_turn_player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'game_sessions_winner_id_fkey'
            columns: ['winner_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      matchmaking_queue: {
        Row: {
          created_at: string
          id: string
          player_id: string
          status: Database['public']['Enums']['queue_status']
        }
        Insert: {
          created_at?: string
          id?: string
          player_id: string
          status?: Database['public']['Enums']['queue_status']
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string
          status?: Database['public']['Enums']['queue_status']
        }
        Relationships: [
          {
            foreignKeyName: 'matchmaking_queue_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      questions: {
        Row: {
          category_id: string
          question_text: string
          correct_answer: string
          answer_variants: string[]
          point_value: number
          difficulty: 'easy' | 'medium' | 'hard'
          air_date: string | null
          source: string
          created_at: string
          id: string
        }
        Insert: {
          category_id: string
          question_text: string
          correct_answer: string
          answer_variants?: string[]
          point_value: number
          difficulty?: 'easy' | 'medium' | 'hard'
          air_date?: string | null
          source?: string
          created_at?: string
          id?: string
        }
        Update: {
          category_id?: string
          question_text?: string
          correct_answer?: string
          answer_variants?: string[]
          point_value?: number
          difficulty?: 'easy' | 'medium' | 'hard'
          air_date?: string | null
          source?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'questions_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          elo_rating: number
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          elo_rating?: number
          id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          elo_rating?: number
          id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      game_status: 'waiting_for_players' | 'in_progress' | 'completed' | 'cancelled'
      queue_status: 'waiting' | 'matched' | 'cancelled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableName extends keyof PublicSchema['Tables']
> = PublicSchema['Tables'][PublicTableName]['Row']

export type Enums<
  PublicEnumName extends keyof PublicSchema['Enums']
> = PublicSchema['Enums'][PublicEnumName]