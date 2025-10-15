import { validateAnswer, isAnswerAcceptable } from '@/lib/utils/answer-matcher'
import { AnswerValidationResult } from '@/types/game.types'

export class AnswerValidationService {
  /**
   * Validate a player's answer against the correct answer
   */
  static validatePlayerAnswer(
    submittedAnswer: string,
    correctAnswer: string,
    answerVariants: string[] = []
  ): AnswerValidationResult {
    // First try exact match
    const exactMatch = validateAnswer(submittedAnswer, correctAnswer)
    
    if (exactMatch.isCorrect) {
      return exactMatch
    }

    // Check against answer variants
    for (const variant of answerVariants) {
      const variantMatch = validateAnswer(submittedAnswer, variant)
      if (variantMatch.isCorrect) {
        return variantMatch
      }
    }

    // Return the original validation result
    return exactMatch
  }

  /**
   * Check if an answer is acceptable (correct or close enough)
   */
  static isAnswerAcceptable(
    submittedAnswer: string,
    correctAnswer: string,
    answerVariants: string[] = []
  ): boolean {
    return isAnswerAcceptable(submittedAnswer, correctAnswer, answerVariants)
  }

  /**
   * Get answer feedback message
   */
  static getAnswerFeedback(
    validationResult: AnswerValidationResult,
    correctAnswer: string
  ): {
    message: string
    type: 'correct' | 'incorrect' | 'close'
  } {
    if (validationResult.isCorrect) {
      if (validationResult.confidence >= 0.9) {
        return { message: 'Correct!', type: 'correct' }
      } else {
        return { message: 'Correct! (Close enough)', type: 'close' }
      }
    } else {
      return { 
        message: `Incorrect. The correct answer is: ${correctAnswer}`, 
        type: 'incorrect' 
      }
    }
  }

  /**
   * Normalize answer for display
   */
  static normalizeAnswerForDisplay(answer: string): string {
    return answer
      .trim()
      .replace(/^(who is|what is|where is|when is|why is|how is|who was|what was|where was|when was|why was|how was|who are|what are|where are|when are|why are|how are)\s+/i, '')
      .replace(/\b(a|an|the)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Check if answer is too short or too long
   */
  static validateAnswerLength(answer: string): {
    isValid: boolean
    message?: string
  } {
    const normalized = answer.trim()
    
    if (normalized.length === 0) {
      return { isValid: false, message: 'Answer cannot be empty' }
    }
    
    if (normalized.length < 2) {
      return { isValid: false, message: 'Answer is too short' }
    }
    
    if (normalized.length > 200) {
      return { isValid: false, message: 'Answer is too long' }
    }
    
    return { isValid: true }
  }

  /**
   * Check if answer contains inappropriate content
   */
  static validateAnswerContent(answer: string): {
    isValid: boolean
    message?: string
  } {
    const normalized = answer.toLowerCase().trim()
    
    // Basic profanity filter (can be expanded)
    const inappropriateWords = ['spam', 'test', 'asdf', 'qwerty']
    
    for (const word of inappropriateWords) {
      if (normalized.includes(word)) {
        return { isValid: false, message: 'Answer contains inappropriate content' }
      }
    }
    
    return { isValid: true }
  }

  /**
   * Comprehensive answer validation
   */
  static validateAnswerComprehensive(
    submittedAnswer: string,
    correctAnswer: string,
    answerVariants: string[] = []
  ): {
    isValid: boolean
    isCorrect: boolean
    confidence: number
    message: string
    type: 'correct' | 'incorrect' | 'close' | 'invalid'
  } {
    // Check length
    const lengthValidation = this.validateAnswerLength(submittedAnswer)
    if (!lengthValidation.isValid) {
      return {
        isValid: false,
        isCorrect: false,
        confidence: 0,
        message: lengthValidation.message!,
        type: 'invalid'
      }
    }

    // Check content
    const contentValidation = this.validateAnswerContent(submittedAnswer)
    if (!contentValidation.isValid) {
      return {
        isValid: false,
        isCorrect: false,
        confidence: 0,
        message: contentValidation.message!,
        type: 'invalid'
      }
    }

    // Validate against correct answer
    const validationResult = this.validatePlayerAnswer(submittedAnswer, correctAnswer, answerVariants)
    const feedback = this.getAnswerFeedback(validationResult, correctAnswer)

    return {
      isValid: true,
      isCorrect: validationResult.isCorrect,
      confidence: validationResult.confidence,
      message: feedback.message,
      type: feedback.type
    }
  }
}
