'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, XCircle } from 'lucide-react'

interface AnswerInputProps {
  question: string
  correctAnswer: string
  timeRemaining: number
  onSubmit: (answer: string) => void
  disabled?: boolean
  showResult?: boolean
  isCorrect?: boolean
  onTimeout?: () => void
}

export function AnswerInput({
  question,
  correctAnswer,
  timeRemaining,
  onSubmit,
  disabled = false,
  showResult = false,
  isCorrect = false,
  onTimeout
}: AnswerInputProps) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (timeRemaining <= 0 && !submitted) {
      onTimeout?.()
    }
  }, [timeRemaining, submitted, onTimeout])

  const handleSubmit = () => {
    if (answer.trim() && !submitted) {
      setSubmitted(true)
      onSubmit(answer.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !submitted) {
      handleSubmit()
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    return seconds.toString()
  }

  const getTimeColor = () => {
    if (timeRemaining > 3000) return 'text-green-600'
    if (timeRemaining > 1000) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Answer the Question</CardTitle>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <Badge variant={timeRemaining > 2000 ? "default" : "destructive"} className="text-lg px-3 py-1">
              {formatTime(timeRemaining)}s
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Question Display */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-lg font-medium">{question}</p>
        </div>

        {/* Answer Input */}
        {!showResult && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="answer" className="text-sm font-medium">
                Your Answer:
              </label>
              <Input
                id="answer"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer here..."
                disabled={disabled || submitted}
                className="text-lg p-4"
                autoFocus
              />
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!answer.trim() || disabled || submitted}
              className="w-full text-lg py-3"
            >
              {submitted ? 'Submitted' : 'Submit Answer'}
            </Button>
          </div>
        )}

        {/* Result Display */}
        {showResult && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg flex items-center space-x-3 ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {isCorrect ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <div>
                <p className={`font-semibold ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isCorrect ? 'Well done!' : 'Better luck next time!'}
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Correct Answer:</p>
              <p className="text-lg font-semibold text-blue-900">{correctAnswer}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground text-center">
          {!showResult ? (
            <p>
              You have {formatTime(timeRemaining)} seconds to answer. 
              Press Enter or click Submit when ready.
            </p>
          ) : (
            <p>
              {isCorrect 
                ? 'Great job! You earned the points for this question.'
                : 'The correct answer has been revealed. Better luck next time!'
              }
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
