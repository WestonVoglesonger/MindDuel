'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Question } from '@/types/game.types'
import { Clock, X } from 'lucide-react'

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <DialogTitle className="text-2xl font-bold">
                {categoryName}
              </DialogTitle>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                ${pointValue}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Text */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <p className="text-xl md:text-2xl font-medium leading-relaxed">
              {question.question_text}
            </p>
          </div>

          {/* Buzzer Section */}
          {!buzzerWinner && (
            <div className="text-center space-y-4">
              {buzzerEnabled ? (
                <div className="space-y-4">
                  <div className="text-green-600 text-lg font-semibold animate-pulse">
                    🔔 BUZZ NOW!
                  </div>
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white text-xl px-8 py-4 rounded-full animate-pulse"
                    onClick={onBuzzerPress}
                  >
                    BUZZ IN
                  </Button>
                </div>
              ) : (
                <div className="text-gray-500 text-lg">
                  Wait for the buzzer to activate...
                </div>
              )}
            </div>
          )}

          {/* Buzzer Winner */}
          {buzzerWinner && (
            <div className="text-center space-y-4">
              <div className="text-lg font-semibold">
                {buzzerWinner === currentPlayerId ? (
                  <span className="text-green-600">You buzzed in first!</span>
                ) : (
                  <span className="text-red-600">
                    {playerNames[buzzerWinner] || 'Opponent'} buzzed in first
                  </span>
                )}
              </div>
              
              {buzzerWinner === currentPlayerId && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-lg">
                    <Clock className="h-5 w-5" />
                    <span>Time Remaining: {formatTimeRemaining(timeRemaining)}s</span>
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your answer here..."
                      className="w-full p-4 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isAnswering}
                      autoFocus
                    />
                    
                    <Button
                      onClick={handleAnswerSubmit}
                      disabled={!answer.trim() || isAnswering}
                      className="w-full text-lg py-3"
                    >
                      Submit Answer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Answer Display */}
          {showAnswer && (
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold">Correct Answer:</h3>
              <p className="text-xl font-medium text-green-600">
                {correctAnswer}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-muted-foreground text-center">
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
      </DialogContent>
    </Dialog>
  )
}
