// Game Configuration Constants
export const GAME_CONFIG = {
  // Board dimensions
  BOARD_ROWS: 5,
  BOARD_COLS: 5,
  TOTAL_QUESTIONS: 25,
  
  // Point values for each row
  POINT_VALUES: [200, 400, 600, 800, 1000],
  
  // Timing settings
  BUZZER_DELAY_MIN: 1000, // 1 second
  BUZZER_DELAY_MAX: 3000, // 3 seconds
  ANSWER_TIMEOUT: 5000, // 5 seconds
  
  // ELO settings
  INITIAL_ELO: 1200,
  K_FACTOR_NOVICE: 32, // < 30 games
  K_FACTOR_INTERMEDIATE: 24, // 30-99 games
  K_FACTOR_VETERAN: 16, // 100+ games
  
  // Matchmaking settings
  ELO_RANGE_INITIAL: 100,
  ELO_RANGE_EXPANDED: 200,
  ELO_RANGE_MAX: 400,
  MATCHMAKING_TIMEOUT: 30000, // 30 seconds
  
  // Answer validation
  MAX_LEVENSHTEIN_DISTANCE_SHORT: 2, // for answers < 10 chars
  MAX_LEVENSHTEIN_DISTANCE_LONG: 3, // for answers >= 10 chars
  SHORT_ANSWER_THRESHOLD: 10,
} as const

// ELO Rating Tiers
export const ELO_TIERS = {
  NOVICE: { min: 0, max: 1000, label: 'Novice', color: 'bg-gray-500' },
  BRONZE: { min: 1000, max: 1200, label: 'Bronze', color: 'bg-orange-600' },
  SILVER: { min: 1200, max: 1400, label: 'Silver', color: 'bg-gray-400' },
  GOLD: { min: 1400, max: 1600, label: 'Gold', color: 'bg-yellow-500' },
  PLATINUM: { min: 1600, max: 1800, label: 'Platinum', color: 'bg-blue-500' },
  DIAMOND: { min: 1800, max: 2000, label: 'Diamond', color: 'bg-purple-500' },
  MASTER: { min: 2000, max: Infinity, label: 'Master', color: 'bg-red-500' },
} as const

// Game statuses
export const GAME_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const

// Question difficulties
export const QUESTION_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const
