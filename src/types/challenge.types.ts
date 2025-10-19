export type ChallengeStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled'

export interface Challenge {
  id: string
  challenger_id: string
  challenged_id: string
  status: ChallengeStatus
  message?: string
  expires_at: string
  created_at: string
  updated_at: string
  responded_at?: string
}

export interface ChallengeWithUsers extends Challenge {
  challenger: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
    elo_rating: number
  }
  challenged: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
    elo_rating: number
  }
}

export interface CreateChallengeRequest {
  challenged_id: string
  message?: string
}

export interface ChallengeNotification {
  id: string
  type: 'challenge_received' | 'challenge_accepted' | 'challenge_declined' | 'challenge_expired'
  challenger_id: string
  challenged_id: string
  challenger_username: string
  challenger_display_name: string
  message?: string
  created_at: string
  expires_at?: string
}

export interface ChallengeResponse {
  success: boolean
  challenge?: Challenge
  game_session_id?: string
  error?: string
}

export interface ChallengeListResponse {
  sent: ChallengeWithUsers[]
  received: ChallengeWithUsers[]
  pending_count: number
}
