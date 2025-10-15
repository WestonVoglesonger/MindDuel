'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GameBoard } from '@/components/game/GameBoard'
import { QuestionCard } from '@/components/game/QuestionCard'
import { ScoreDisplay } from '@/components/game/ScoreDisplay'
import { BuzzerButton } from '@/components/game/BuzzerButton'
import { AnswerInput } from '@/components/game/AnswerInput'
import { useRealtimeGame } from '@/hooks/useRealtimeGame'
import { useBuzzer } from '@/hooks/useBuzzer'
import { GameService } from '@/lib/services/game.service'
import { UserService } from '@/lib/services/user.service'
import { Question, User } from '@/types/game.types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Trophy, Home } from 'lucide-react'

interface GamePageProps {
  params: {
    gameId: string
  }
}

export default function GamePage({ params }: GamePageProps) {
  const [user, setUser] = useState<User | null>(null)
  const [opponent, setOpponent] = useState<User | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gamePhase, setGamePhase] = useState<'waiting' | 'playing' | 'completed'>('waiting')
  
  const router = useRouter()
  const supabase = createClient()
  const gameService = new GameService()
  const userService = new UserService()

  const {
    gameSession,
    gameState,
    loading: gameLoading,
    error: gameError,
    handleBuzzerPress,
    handleAnswerSubmission,
    handleQuestionSelection,
    resetGameState,
    isMyTurn,
    isPlayer1,
    isPlayer2
  } = useRealtimeGame({
    gameSessionId: params.gameId,
    userId: user?.id || '',
    onGameUpdate: (session) => {
      console.log('Game updated:', session)
    },
    onGameComplete: (result) => {
      console.log('Game completed:', result)
      setGamePhase('completed')
    },
    onError: (err) => {
      setError(err.message)
    }
  })

  const {
    buzzerEnabled,
    buzzerPressed,
    answerTimeRemaining,
    isAnswering,
    enableBuzzer,
    disableBuzzer,
    pressBuzzer,
    startAnswerTimer,
    stopAnswerTimer,
    resetBuzzer,
    cleanup
  } = useBuzzer({
    onBuzzerActivate: () => {
      console.log('Buzzer activated!')
    },
    onBuzzerPress: () => {
      console.log('Buzzer pressed!')
    },
    onAnswerTimeout: () => {
      console.log('Answer timeout!')
    },
    onAnswerTick: (timeRemaining) => {
      console.log('Time remaining:', timeRemaining)
    }
  })

  useEffect(() => {
    async function loadGame() {
      try {
        // Load current user
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/login')
          return
        }

        const userData = await userService.getUserById(authUser.id)
        if (!userData) {
          setError('User not found')
          return
        }
        setUser(userData)

        // Load game session
        const session = await gameService.getGameSession(params.gameId)
        if (!session) {
          setError('Game not found')
          return
        }

        // Load opponent
        const opponentId = session.player1_id === userData.id ? session.player2_id : session.player1_id
        const opponentData = await userService.getUserById(opponentId)
        if (opponentData) {
          setOpponent(opponentData)
        }

        // Load game questions
        const gameQuestions = await gameService.getGameQuestions(params.gameId)
        const questionData = gameQuestions.map(gq => gq.question).filter(Boolean)
        setQuestions(questionData)

        // Extract categories
        const uniqueCategories = [...new Set(questionData.map(q => q.category_id))]
        setCategories(uniqueCategories)

        setGamePhase('playing')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game')
      } finally {
        setLoading(false)
      }
    }

    loadGame()
  }, [params.gameId, router, supabase.auth, userService, gameService])

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  const handleQuestionClick = async (question: Question, position: number) => {
    if (!isMyTurn) return

    try {
      await handleQuestionSelection(question.id)
      
      // Enable buzzer after a delay
      setTimeout(() => {
        enableBuzzer()
      }, Math.random() * 2000 + 1000) // 1-3 seconds
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select question')
    }
  }

  const handleBuzzerClick = async () => {
    if (!gameState.currentQuestion) return

    const success = await handleBuzzerPress(gameState.currentQuestion.id)
    if (success) {
      pressBuzzer()
      startAnswerTimer()
    }
  }

  const handleAnswerSubmit = async (answer: string) => {
    if (!gameState.currentQuestion) return

    try {
      const result = await handleAnswerSubmission(gameState.currentQuestion.id, answer)
      
      if (result.isCorrect) {
        // Correct answer - continue to next question
        resetGameState()
        resetBuzzer()
      } else {
        // Incorrect answer - opponent gets chance
        stopAnswerTimer()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer')
    }
  }

  const handleBackToLobby = () => {
    router.push('/lobby')
  }

  if (loading || gameLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-32 w-32 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-lg">Loading game...</p>
        </div>
      </div>
    )
  }

  if (error || gameError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Alert variant="destructive">
              <AlertDescription>
                {error || gameError}
              </AlertDescription>
            </Alert>
            <Button onClick={handleBackToLobby} className="mt-4">
              <Home className="mr-2 h-4 w-4" />
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user || !opponent || !gameSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Game data not found</p>
            <Button onClick={handleBackToLobby} className="mt-4">
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gamePhase === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Game Complete!</h2>
            <p className="text-lg mb-6">
              {gameSession.winner_id === user.id ? 'You won!' : 'You lost!'}
            </p>
            <div className="space-y-2 mb-6">
              <p>Final Score:</p>
              <p className="font-bold">
                {user.display_name || user.username}: ${gameSession.player1_id === user.id ? gameSession.player1_score : gameSession.player2_score}
              </p>
              <p className="font-bold">
                {opponent.display_name || opponent.username}: ${gameSession.player1_id === opponent.id ? gameSession.player1_score : gameSession.player2_score}
              </p>
            </div>
            <Button onClick={handleBackToLobby} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Score Display */}
        <ScoreDisplay
          player1={{
            id: gameSession.player1_id,
            username: gameSession.player1_id === user.id ? user.username : opponent.username,
            displayName: gameSession.player1_id === user.id ? user.display_name || user.username : opponent.display_name || opponent.username,
            avatarUrl: gameSession.player1_id === user.id ? user.avatar_url : opponent.avatar_url,
            score: gameSession.player1_score,
            eloRating: gameSession.player1_id === user.id ? user.elo_rating : opponent.elo_rating,
            isCurrentPlayer: gameSession.current_turn_player_id === gameSession.player1_id
          }}
          player2={{
            id: gameSession.player2_id,
            username: gameSession.player2_id === user.id ? user.username : opponent.username,
            displayName: gameSession.player2_id === user.id ? user.display_name || user.username : opponent.display_name || opponent.username,
            avatarUrl: gameSession.player2_id === user.id ? user.avatar_url : opponent.avatar_url,
            score: gameSession.player2_score,
            eloRating: gameSession.player2_id === user.id ? user.elo_rating : opponent.elo_rating,
            isCurrentPlayer: gameSession.current_turn_player_id === gameSession.player2_id
          }}
          currentTurnPlayerId={gameSession.current_turn_player_id || ''}
          questionsRemaining={25 - (gameSession.board_state?.answeredQuestions?.length || 0)}
          gamePhase={gameSession.status}
        />

        {/* Game Board */}
        <div className="mb-8">
          <GameBoard
            questions={questions}
            categories={categories}
            selectedQuestions={new Set(gameSession.board_state?.selectedQuestions || [])}
            answeredQuestions={new Set(gameSession.board_state?.answeredQuestions || [])}
            currentPlayerTurn={gameSession.current_turn_player_id || ''}
            currentPlayerId={user.id}
            onQuestionSelect={handleQuestionClick}
            disabled={!isMyTurn}
          />
        </div>

        {/* Question Card */}
        {gameState.currentQuestion && (
          <QuestionCard
            question={gameState.currentQuestion}
            categoryName={gameState.currentQuestion.category_id}
            pointValue={gameState.currentQuestion.point_value}
            isOpen={!!gameState.currentQuestion}
            onClose={() => resetGameState()}
            buzzerEnabled={buzzerEnabled}
            buzzerWinner={gameState.buzzerWinner}
            timeRemaining={answerTimeRemaining}
            onBuzzerPress={handleBuzzerClick}
            onAnswerSubmit={handleAnswerSubmit}
            isAnswering={isAnswering}
            currentPlayerId={user.id}
            playerNames={{
              [user.id]: user.display_name || user.username,
              [opponent.id]: opponent.display_name || opponent.username
            }}
          />
        )}

        {/* Buzzer Button */}
        {gameState.currentQuestion && buzzerEnabled && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <BuzzerButton
              enabled={buzzerEnabled}
              pressed={buzzerPressed}
              timeRemaining={answerTimeRemaining}
              onPress={handleBuzzerClick}
              disabled={!isMyTurn}
            />
          </div>
        )}
      </div>
    </div>
  )
}
