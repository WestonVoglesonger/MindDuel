'use client'

import { useState } from 'react'
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
    return row * GAME_CONFIG.BOARD_SIZE.COLS + col
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
      <div className="grid grid-cols-5 gap-3 mb-6">
        {categories.map((category, index) => (
          <div key={index} className="category-header">
            <h3 className="text-sm md:text-base font-semibold truncate">
              {category}
            </h3>
          </div>
        ))}
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: GAME_CONFIG.BOARD_SIZE.ROWS }, (_, row) =>
          Array.from({ length: GAME_CONFIG.BOARD_SIZE.COLS }, (_, col) => {
            const question = getQuestionAtPosition(row, col)
            const position = getPosition(row, col)
            const pointValue = GAME_CONFIG.POINT_VALUES[row]
            const isSelectable = isQuestionSelectable(row, col)
            const isSelected = isQuestionSelected(row, col)
            const isAnswered = isQuestionAnswered(row, col)
            const isHovered = hoveredPosition === position

            let tileClass = 'game-tile '
            if (isAnswered) {
              tileClass += 'game-tile-answered'
            } else if (isSelected) {
              tileClass += 'game-tile-selected'
            } else if (isSelectable) {
              tileClass += 'game-tile-available'
            } else {
              tileClass += 'game-tile-answered' // Disabled state
            }

            return (
              <div
                key={`${row}-${col}`}
                className={tileClass}
                onClick={() => handleQuestionClick(row, col)}
                onMouseEnter={() => setHoveredPosition(position)}
                onMouseLeave={() => setHoveredPosition(null)}
              >
                {isAnswered ? (
                  <div className="text-sm">✓</div>
                ) : isSelected ? (
                  <div className="text-xs font-medium">SELECTED</div>
                ) : (
                  <div className="text-lg md:text-xl font-bold">
                    ${pointValue}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Game Status */}
      <div className="mt-8 text-center">
        {currentPlayerTurn === currentPlayerId ? (
          <div className="inline-flex items-center px-6 py-3 bg-cyan-400 text-white font-semibold rounded-lg">
            Your Turn - Select a Question
          </div>
        ) : (
          <div className="inline-flex items-center px-6 py-3 bg-slate-800 border border-slate-700 text-slate-400 font-medium rounded-lg">
            Waiting for Opponent...
          </div>
        )}
      </div>
    </div>
  )
}
