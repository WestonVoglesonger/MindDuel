export const GAME_CONFIG = {
  BOARD_SIZE: {
    ROWS: 5,
    COLS: 6,
  },
  POINT_VALUES: [200, 400, 600, 800, 1000],
  QUESTION_TIMER_SECONDS: 5,
  ANSWER_TIMER_SECONDS: 10,
  BUZZER_DELAY_MS: {
    MIN: 50,
    MAX: 200,
  },
  POINTS: {
    CORRECT_ANSWER: 100,
    INCORRECT_ANSWER: -50,
    DAILY_DOUBLE_MULTIPLIER: 2, // For future expansion
  },
  ELO: {
    INITIAL_RATING: 1000,
    K_FACTOR: 32, // Standard K-factor for ELO
  },
  MATCHMAKING: {
    QUEUE_TIMEOUT_SECONDS: 60,
    ELO_RANGE_INITIAL: 100,
    ELO_RANGE_INCREASE_PER_SECOND: 10,
  },
  ROUNDS: {
    ROUND_1: 'Round 1',
    ROUND_2: 'Round 2',
    FINAL_QUESTION: 'Final Question',
  },
}