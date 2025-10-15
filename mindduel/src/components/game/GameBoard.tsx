'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Question } from '@/types/game.types'
import { GAME_CONFIG } from '@/constants/game-config'

interface GameBoardProps {
  questions: Question[]
  categories: string[]
  selectedQuestions: Set<number>
  answeredQuestions: Set<number>
  currentPlayerTurn: string
  currentPlayerId: string
  onQuestionSelect: (question: Question, position: number) => void
  disabled?: boolean
}

export function GameBoard({
  questions,
  categories,
  selectedQuestions,
  answeredQuestions,
  currentPlayerTurn,
  currentPlayerId,
  onQuestionSelect,
  disabled = false
}: GameBoardProps) {
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null)

  // Organize questions by category and point value
  const organizedQuestions = categories.map((category, categoryIndex) => {
    const categoryQuestions = questions
      .filter(q => q.category_id === category)
      .sort((a, b) => a.point_value - b.point_value)
    
    return {
      category,
      questions: categoryQuestions
    }
  })

  const getQuestionAtPosition = (row: number, col: number): Question | null => {
    const categoryQuestions = organizedQuestions[col]?.questions
    return categoryQuestions?.[row] || null
  }

  const getPosition = (row: number, col: number): number => {
    return row * GAME_CONFIG.BOARD_COLS + col
  }

  const isQuestionSelectable = (row: number, col: number): boolean => {
    const position = getPosition(row, col)
    const question = getQuestionAtPosition(row, col)
    
    return !!(
      question &&
      !selectedQuestions.has(position) &&
      !answeredQuestions.has(position) &&
      currentPlayerTurn === currentPlayerId &&
      !disabled
    )
  }

  const isQuestionSelected = (row: number, col: number): boolean => {
    const position = getPosition(row, col)
    return selectedQuestions.has(position)
  }

  const isQuestionAnswered = (row: number, col: number): boolean => {
    const position = getPosition(row, col)
    return answeredQuestions.has(position)
  }

  const handleQuestionClick = (row: number, col: number) => {
    const question = getQuestionAtPosition(row, col)
    const position = getPosition(row, col)
    
    if (question && isQuestionSelectable(row, col)) {
      onQuestionSelect(question, position)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Category Headers */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {categories.map((category, index) => (
          <Card key={index} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-4 text-center">
              <h3 className="font-bold text-sm md:text-base truncate">
                {category}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: GAME_CONFIG.BOARD_ROWS }, (_, row) =>
          Array.from({ length: GAME_CONFIG.BOARD_COLS }, (_, col) => {
            const question = getQuestionAtPosition(row, col)
            const position = getPosition(row, col)
            const pointValue = GAME_CONFIG.POINT_VALUES[row]
            const isSelectable = isQuestionSelectable(row, col)
            const isSelected = isQuestionSelected(row, col)
            const isAnswered = isQuestionAnswered(row, col)
            const isHovered = hoveredPosition === position

            return (
              <Card
                key={`${row}-${col}`}
                className={`
                  aspect-square cursor-pointer transition-all duration-200
                  ${isSelectable 
                    ? 'hover:scale-105 hover:shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' 
                    : isAnswered 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 cursor-not-allowed'
                  }
                  ${isHovered && isSelectable ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                `}
                onClick={() => handleQuestionClick(row, col)}
                onMouseEnter={() => setHoveredPosition(position)}
                onMouseLeave={() => setHoveredPosition(null)}
              >
                <CardContent className="flex items-center justify-center h-full p-2">
                  <div className="text-center">
                    {isAnswered ? (
                      <div className="text-xs">✓</div>
                    ) : isSelected ? (
                      <div className="text-xs">SELECTED</div>
                    ) : (
                      <div className="font-bold text-lg md:text-xl">
                        ${pointValue}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Game Status */}
      <div className="mt-6 text-center">
        {currentPlayerTurn === currentPlayerId ? (
          <Badge variant="default" className="text-lg px-4 py-2">
            Your Turn - Select a Question
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Waiting for Opponent...
          </Badge>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center space-x-4 text-sm text-muted-foreground">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-300 rounded"></div>
          <span>Answered</span>
        </div>
      </div>
    </div>
  )
}
