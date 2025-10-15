import { Question } from '@/types/game.types'
import { GAME_CONFIG } from '@/constants/game-config'

const CATEGORY_LABELS = ['Science', 'History', 'Sports', 'Music', 'Movies']

function createQuestion(
  category: string,
  value: number,
  index: number,
  seed: string
): Question {
  const questionId = `test-${category.toLowerCase()}-${value}-${index}-${seed}`
  return {
    id: questionId,
    category_id: category,
    question_text: `(${category} ${value}) What is the answer to sample question ${index + 1}?`,
    correct_answer: `${category} Answer ${index + 1}`,
    answer_variants: [],
    point_value: value,
    difficulty: value <= 400 ? 'easy' : value >= 800 ? 'hard' : 'medium',
    air_date: null,
    source: 'Test Harness',
    created_at: new Date().toISOString(),
  }
}

export function generateTestGameData(seed: string): {
  categories: string[]
  questions: Question[]
} {
  const questions: Question[] = []

  CATEGORY_LABELS.forEach((category, categoryIndex) => {
    GAME_CONFIG.POINT_VALUES.forEach((value, rowIndex) => {
      questions.push(
        createQuestion(category, value, categoryIndex * GAME_CONFIG.BOARD_SIZE.COLS + rowIndex, seed)
      )
    })
  })

  return {
    categories: CATEGORY_LABELS,
    questions,
  }
}
