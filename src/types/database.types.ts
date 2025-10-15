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
          turn_player_id: string | null
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
          turn_player_id?: string | null
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
          turn_player_id?: string | null
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
            foreignKeyName: 'game_sessions_turn_player_id_fkey'
            columns: ['turn_player_id']
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
          answer: string
          category_id: string
          clue: string
          created_at: string
          difficulty: number
          id: string
          round: string
          value: number
        }
        Insert: {
          answer: string
          category_id: string
          clue: string
          created_at?: string
          difficulty?: number
          id?: string
          round: string
          value: number
        }
        Update: {
          answer?: string
          category_id?: string
          clue?: string
          created_at?: string
          difficulty?: number
          id?: string
          round?: string
          value?: number
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
          elo_rating: number
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          elo_rating?: number
          id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
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