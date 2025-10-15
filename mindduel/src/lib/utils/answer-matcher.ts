import { GAME_CONFIG } from '@/constants/game-config'
import { AnswerValidationResult } from '@/types/game.types'

/**
 * Calculate Levenshtein distance between two strings
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Distance between strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Normalize answer text for comparison
 * @param text - Text to normalize
 * @returns Normalized text
 */
function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove common prefixes
    .replace(/^(who is|what is|where is|when is|why is|how is|who was|what was|where was|when was|why was|how was|who are|what are|where are|when are|why are|how are)\s+/i, '')
    // Remove articles
    .replace(/\b(a|an|the)\b/g, '')
    // Remove punctuation
    .replace(/[^\w\s]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Check if two answers are equivalent
 * @param submittedAnswer - Answer submitted by player
 * @param correctAnswer - Correct answer from database
 * @returns Validation result with confidence score
 */
export function validateAnswer(submittedAnswer: string, correctAnswer: string): AnswerValidationResult {
  const normalizedSubmitted = normalizeAnswer(submittedAnswer)
  const normalizedCorrect = normalizeAnswer(correctAnswer)

  // Exact match
  if (normalizedSubmitted === normalizedCorrect) {
    return {
      isCorrect: true,
      confidence: 1.0,
      normalizedAnswer: normalizedSubmitted,
      normalizedCorrect: normalizedCorrect,
    }
  }

  // Check against answer variants if available
  // This would be used when we have answer_variants array from the database
  // For now, we'll implement basic fuzzy matching

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(normalizedSubmitted, normalizedCorrect)
  const maxLength = Math.max(normalizedSubmitted.length, normalizedCorrect.length)

  // Calculate confidence based on distance and length
  const confidence = maxLength > 0 ? 1 - (distance / maxLength) : 0

  // Determine if answer is correct based on distance thresholds
  const maxDistance = normalizedCorrect.length < GAME_CONFIG.SHORT_ANSWER_THRESHOLD
    ? GAME_CONFIG.MAX_LEVENSHTEIN_DISTANCE_SHORT
    : GAME_CONFIG.MAX_LEVENSHTEIN_DISTANCE_LONG

  const isCorrect = distance <= maxDistance && confidence > 0.6

  return {
    isCorrect,
    confidence,
    normalizedAnswer: normalizedSubmitted,
    normalizedCorrect: normalizedCorrect,
  }
}

/**
 * Generate answer variants for a correct answer
 * @param correctAnswer - The correct answer
 * @returns Array of possible answer variants
 */
export function generateAnswerVariants(correctAnswer: string): string[] {
  const variants = new Set<string>()
  const normalized = normalizeAnswer(correctAnswer)

  // Add the normalized version
  variants.add(normalized)

  // Add version with common prefixes
  const prefixes = ['who is', 'what is', 'where is', 'when is', 'why is', 'how is']
  prefixes.forEach(prefix => {
    variants.add(`${prefix} ${normalized}`)
  })

  // Add version with articles
  const articles = ['a', 'an', 'the']
  articles.forEach(article => {
    variants.add(`${article} ${normalized}`)
  })

  // Add version with both prefix and article
  prefixes.forEach(prefix => {
    articles.forEach(article => {
      variants.add(`${prefix} ${article} ${normalized}`)
    })
  })

  // Add common abbreviations and variations
  const commonAbbreviations: Record<string, string[]> = {
    'united states': ['usa', 'us', 'america'],
    'united kingdom': ['uk', 'britain', 'england'],
    'new york': ['ny', 'new york city'],
    'los angeles': ['la'],
    'san francisco': ['sf'],
    'washington dc': ['washington', 'dc'],
  }

  Object.entries(commonAbbreviations).forEach(([full, abbrevs]) => {
    if (normalized.includes(full)) {
      abbrevs.forEach(abbrev => {
        variants.add(normalized.replace(full, abbrev))
      })
    }
  })

  return Array.from(variants).filter(variant => variant.length > 0)
}

/**
 * Check if an answer is close enough to be considered correct
 * @param submittedAnswer - Answer submitted by player
 * @param correctAnswer - Correct answer
 * @param answerVariants - Array of acceptable answer variants
 * @returns True if answer is acceptable
 */
export function isAnswerAcceptable(
  submittedAnswer: string,
  correctAnswer: string,
  answerVariants: string[] = []
): boolean {
  // First check exact match against correct answer
  const exactMatch = validateAnswer(submittedAnswer, correctAnswer)
  if (exactMatch.isCorrect) {
    return true
  }

  // Check against variants
  for (const variant of answerVariants) {
    const variantMatch = validateAnswer(submittedAnswer, variant)
    if (variantMatch.isCorrect) {
      return true
    }
  }

  return false
}
