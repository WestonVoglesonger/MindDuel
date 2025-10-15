/**
 * Calculates the Levenshtein distance between two strings.
 * @param a The first string.
 * @param b The second string.
 * @returns The Levenshtein distance.
 */
function levenshteinDistance(a: string, b: string): number {
  const an = a.length
  const bn = b.length

  if (an === 0) return bn
  if (bn === 0) return an

  const matrix: number[][] = []

  // increment along the first column of each row
  for (let i = 0; i <= an; i++) {
    matrix[i] = [i]
  }

  // increment along the first row
  for (let j = 1; j <= bn; j++) {
    matrix[0][j] = j
  }

  // fill in the rest of the matrix
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return matrix[an][bn]
}

/**
 * Normalizes a string for comparison by converting to lowercase,
 * removing punctuation, and trimming whitespace.
 * @param str The input string.
 * @returns The normalized string.
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * Result of answer validation
 */
export interface AnswerValidationResult {
  isCorrect: boolean
  confidence: number
  distance: number
}

/**
 * Performs fuzzy matching between a user's answer and the correct answer.
 * @param userAnswer The answer provided by the user.
 * @param correctAnswer The correct answer from the database.
 * @param tolerance The maximum Levenshtein distance allowed for a match (e.g., 1 or 2 for typos).
 * @returns True if the answers match within the given tolerance, false otherwise.
 */
export function fuzzyMatchAnswer(
  userAnswer: string,
  correctAnswer: string,
  tolerance: number = 1
): boolean {
  const normalizedUser = normalizeString(userAnswer)
  const normalizedCorrect = normalizeString(correctAnswer)

  if (normalizedUser === normalizedCorrect) {
    return true
  }

  const distance = levenshteinDistance(normalizedUser, normalizedCorrect)
  return distance <= tolerance
}

/**
 * Validates an answer and returns detailed result
 */
export function validateAnswer(
  userAnswer: string,
  correctAnswer: string,
  tolerance: number = 1
): AnswerValidationResult {
  const normalizedUser = normalizeString(userAnswer)
  const normalizedCorrect = normalizeString(correctAnswer)

  if (normalizedUser === normalizedCorrect) {
    return {
      isCorrect: true,
      confidence: 1.0,
      distance: 0
    }
  }

  const distance = levenshteinDistance(normalizedUser, normalizedCorrect)
  const isCorrect = distance <= tolerance
  const confidence = Math.max(0, 1 - (distance / Math.max(normalizedUser.length, normalizedCorrect.length)))

  return {
    isCorrect,
    confidence,
    distance
  }
}

/**
 * Generates common answer variants for a given answer.
 * This includes common alternate phrasings, abbreviations, etc.
 * @param answer The original answer
 * @returns Array of answer variants
 */
export function generateAnswerVariants(answer: string): string[] {
  const variants: string[] = []
  const normalized = normalizeString(answer)

  // Add the normalized version
  variants.push(normalized)

  // Common patterns for Jeopardy-style answers
  // Remove "the" from beginning if present
  if (normalized.startsWith('the ')) {
    variants.push(normalized.substring(4))
  }

  // Remove "a " from beginning if present
  if (normalized.startsWith('a ')) {
    variants.push(normalized.substring(2))
  }

  // Remove "an " from beginning if present
  if (normalized.startsWith('an ')) {
    variants.push(normalized.substring(3))
  }

  // Handle "what is/are" prefixes (common in Jeopardy)
  if (normalized.startsWith('what is ')) {
    variants.push(normalized.substring(8))
  }
  if (normalized.startsWith('what are ')) {
    variants.push(normalized.substring(9))
  }
  if (normalized.startsWith('who is ')) {
    variants.push(normalized.substring(7))
  }
  if (normalized.startsWith('who are ')) {
    variants.push(normalized.substring(8))
  }

  // Add original answer as well (in case it's already normalized)
  if (!variants.includes(answer.toLowerCase())) {
    variants.push(answer.toLowerCase())
  }

  return [...new Set(variants)] // Remove duplicates
}

/**
 * Check if an answer is acceptable (correct or close enough)
 */
export function isAnswerAcceptable(
  userAnswer: string,
  correctAnswer: string,
  answerVariants: string[] = [],
  tolerance: number = 1
): boolean {
  // Check main answer
  if (fuzzyMatchAnswer(userAnswer, correctAnswer, tolerance)) {
    return true
  }

  // Check variants
  for (const variant of answerVariants) {
    if (fuzzyMatchAnswer(userAnswer, variant, tolerance)) {
      return true
    }
  }

  return false
}