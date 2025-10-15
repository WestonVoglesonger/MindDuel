'use client'

import { useEffect, useState } from 'react'
import { Question } from '@/types/game.types'

interface QuestionCardProps {
  question: Question | null
  categoryName: string
  pointValue: number
  isOpen: boolean
  onClose: () => void
  buzzerEnabled: boolean
  buzzerWinner: string | null
  timeRemaining: number
  onBuzzerPress: () => void
  onAnswerSubmit: (answer: string) => void
  isAnswering: boolean
  currentPlayerId: string
  playerNames: { [key: string]: string }
}

export function QuestionCard({
  question,
  categoryName,
  pointValue,
  isOpen,
  onClose,
  buzzerEnabled,
  buzzerWinner,
  timeRemaining,
  onBuzzerPress,
  onAnswerSubmit,
  isAnswering,
  currentPlayerId,
  playerNames
}: QuestionCardProps) {
  const [answer, setAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState('')

  useEffect(() => {
    if (isOpen && question) {
      setAnswer('')
      setShowAnswer(false)
      setCorrectAnswer(question.correct_answer)
    }
  }, [isOpen, question])

  const handleAnswerSubmit = () => {
    if (answer.trim()) {
      onAnswerSubmit(answer.trim())
      setShowAnswer(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnswering) {
      handleAnswerSubmit()
    }
  }

  const formatTimeRemaining = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    return seconds.toString()
  }

  if (!question) return null

  return (
    <>
      {/* Custom Modal Overlay */}
      {isOpen && (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-slate-100">
                  {categoryName}
                </h2>
                <div className="px-3 py-1 bg-cyan-400 text-white text-lg font-semibold rounded">
                  ${pointValue}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Question Text */}
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                <p className="text-xl md:text-2xl font-medium leading-relaxed text-slate-100">
                  {question.question_text}
                </p>
              </div>

              {/* Buzzer Section */}
              {!buzzerWinner && (
                <div className="text-center space-y-4">
                  {buzzerEnabled ? (
                    <div className="space-y-4">
                      <div className="text-cyan-400 text-lg font-semibold pulse-cyan">
                        🔔 BUZZ NOW!
                      </div>
                      <button
                        className="btn-primary text-xl px-8 py-4 rounded-lg pulse-cyan"
                        onClick={onBuzzerPress}
                      >
                        BUZZ IN
                      </button>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-lg">
                      Wait for the buzzer to activate...
                    </div>
                  )}
                </div>
              )}

              {/* Buzzer Winner */}
              {buzzerWinner && (
                <div className="text-center space-y-4">
                  <div className="text-lg font-semibold text-slate-100">
                    {buzzerWinner === currentPlayerId ? (
                      <span className="text-emerald-500">You buzzed in first!</span>
                    ) : (
                      <span className="text-red-500">
                        {playerNames[buzzerWinner] || 'Opponent'} buzzed in first
                      </span>
                    )}
                  </div>
                  
                  {buzzerWinner === currentPlayerId && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-lg text-slate-100">
                        <span>⏱️</span>
                        <span>Time Remaining: {formatTimeRemaining(timeRemaining)}s</span>
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your answer here..."
                          className="input-custom text-lg w-full"
                          disabled={isAnswering}
                          autoFocus
                        />
                        
                        <button
                          onClick={handleAnswerSubmit}
                          disabled={!answer.trim() || isAnswering}
                          className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Submit Answer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Answer Display */}
              {showAnswer && (
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold text-slate-100">Correct Answer:</h3>
                  <p className="text-xl font-medium text-emerald-500">
                    {correctAnswer}
                  </p>
                </div>
              )}

              {/* Instructions */}
              <div className="text-sm text-slate-400 text-center">
                <p>
                  {!buzzerWinner 
                    ? "Wait for the buzzer to activate, then buzz in to answer"
                    : buzzerWinner === currentPlayerId
                      ? "You have 5 seconds to answer. Press Enter or click Submit."
                      : "Wait for the other player to answer"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
