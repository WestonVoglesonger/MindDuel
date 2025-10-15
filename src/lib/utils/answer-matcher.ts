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