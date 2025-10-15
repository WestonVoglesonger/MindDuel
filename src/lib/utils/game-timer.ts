/**
 * Calculates the remaining time in seconds for a given timer.
 * @param startTime The ISO string of when the timer started.
 * @param durationSeconds The total duration of the timer in seconds.
 * @returns The remaining time in seconds, or 0 if time has run out.
 */
export function getRemainingTime(startTime: string | null, durationSeconds: number): number {
  if (!startTime) {
    return durationSeconds
  }
  const start = new Date(startTime).getTime()
  const now = Date.now()
  const elapsed = (now - start) / 1000 // elapsed in seconds
  return Math.max(0, durationSeconds - elapsed)
}

/**
 * Formats seconds into a MM:SS string.
 * @param totalSeconds The total number of seconds.
 * @returns A formatted string like "00:05".
 */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}