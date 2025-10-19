'use client'

import { useState, useEffect, useMemo, use } from 'react'
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
import { Question, Player as User } from '@/types/game.types'
import { generateTestGameData } from '@/lib/test/test-game-data'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Trophy, Home } from 'lucide-react'

interface GamePageProps {
  params: Promise<{
    gameId: string
  }>
}

export default function GamePage({ params }: GamePageProps) {
  const resolvedParams = use(params)
  
  if (resolvedParams.gameId.startsWith('test-')) {
    return <TestGamePage gameId={resolvedParams.gameId} />
  }

  return <RegularGamePage params={resolvedParams} />
}

function RegularGamePage({ params }: { params: { gameId: string } }) {
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
        // User data is already transformed to Player interface by userService
        setUser(userData)

        // Load game session
        const session = await gameService.getGameSession(params.gameId)
        if (!session) {
          setError('Game not found')
          return
        }

        // Load opponent
        const opponentId = session.player1_id === userData.id ? session.player2_id : session.player1_id
        if (opponentId) {
          const opponentData = await userService.getUserById(opponentId)
          if (opponentData) {
            // Opponent data is already transformed to Player interface by userService
            setOpponent(opponentData)
          }
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
                {user.displayName || user.username}: ${gameSession.player1_id === user.id ? gameSession.player1_score : gameSession.player2_score}
              </p>
              <p className="font-bold">
                {opponent.displayName || opponent.username}: ${gameSession.player1_id === opponent.id ? gameSession.player1_score : gameSession.player2_score}
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
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Score Display */}
        <ScoreDisplay
          player1={{
            id: gameSession.player1_id,
            username: gameSession.player1_id === user.id ? user.username : opponent.username,
            displayName: gameSession.player1_id === user.id ? user.displayName || user.username : opponent.displayName || opponent.username,
            avatarUrl: gameSession.player1_id === user.id ? user.avatarUrl : opponent.avatarUrl,
            score: gameSession.player1_score,
            eloRating: gameSession.player1_id === user.id ? user.eloRating : opponent.eloRating,
            isCurrentPlayer: gameSession.current_turn_player_id === gameSession.player1_id
          }}
          player2={{
            id: gameSession.player2_id!,
            username: gameSession.player2_id === user.id ? user.username : opponent.username,
            displayName: gameSession.player2_id === user.id ? user.displayName || user.username : opponent.displayName || opponent.username,
            avatarUrl: gameSession.player2_id === user.id ? user.avatarUrl : opponent.avatarUrl,
            score: gameSession.player2_score,
            eloRating: gameSession.player2_id === user.id ? user.eloRating : opponent.eloRating,
            isCurrentPlayer: gameSession.current_turn_player_id === gameSession.player2_id
          }}
          currentTurnPlayerId={gameSession.current_turn_player_id || ''}
          questionsRemaining={0}
          gamePhase={gameSession.status}
        />

        {/* Game Board */}
        <div className="mb-8">
          <GameBoard
            questions={questions}
            categories={categories}
            selectedQuestions={new Set()}
            answeredQuestions={new Set()}
            currentPlayerTurn={gameSession?.current_turn_player_id || ''}
            currentPlayerId={user.id}
            onQuestionSelect={handleQuestionClick}
            disabled={gameSession?.status !== 'in_progress' || !gameSession}
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
              [user.id]: user.displayName || user.username,
              [opponent.id]: opponent.displayName || opponent.username
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

function TestGamePage({ gameId }: { gameId: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [questionOpen, setQuestionOpen] = useState(false)
  const [currentPosition, setCurrentPosition] = useState<number | null>(null)
  const [selectedPositions, setSelectedPositions] = useState<number[]>([])
  const [answeredPositions, setAnsweredPositions] = useState<number[]>([])
  const [playerScore, setPlayerScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [gamePhase, setGamePhase] = useState<'playing' | 'completed'>('playing')

  const router = useRouter()
  const supabase = createClient()

  const opponent: User = useMemo(() => ({
    id: 'test-opponent',
    username: 'test_opponent',
    displayName: 'Test Opponent',
    avatarUrl: null,
    eloRating: 1100,
    gamesPlayed: 0,
    gamesWon: 0,
    isOnline: true
  }), [])

  const { categories, questions } = useMemo(() => generateTestGameData(gameId), [gameId])

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/login')
          return
        }

        const userService = new UserService()
        const userData = await userService.getUserById(authUser.id)
        if (!userData) {
          setError('User not found')
          return
        }

        setUser(userData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router, supabase.auth])

  useEffect(() => {
    if (user) {
      setFeedback('Select a question to begin the test match.')
    }
  }, [user])

  const handleBackToLobby = () => {
    router.push('/lobby')
  }

  const handleQuestionSelect = (question: Question, position: number) => {
    if (answeredPositions.includes(position) || selectedPositions.includes(position) || questionOpen) {
      return
    }

    setCurrentQuestion(question)
    setCurrentPosition(position)
    setSelectedPositions([position]) // Only allow one selection at a time
    setQuestionOpen(true)
    setFeedback(`Answer for $${question.point_value}`)
  }

  const closeQuestion = () => {
    setQuestionOpen(false)
    setCurrentQuestion(null)
    setCurrentPosition(null)
    setFeedback(null)
  }

  const totalQuestions = questions.length
  const questionsRemaining = totalQuestions - answeredPositions.length

  const handleAnswerSubmit = (answer: string) => {
    if (!currentQuestion || currentPosition === null || !user) return

    const normalizedAnswer = answer.trim().toLowerCase()
    const correctAnswer = currentQuestion.correct_answer.trim().toLowerCase()
    const isCorrect = normalizedAnswer === correctAnswer

    if (isCorrect) {
      setPlayerScore(prev => prev + currentQuestion.point_value)
      setFeedback(`✅ Correct! You earned $${currentQuestion.point_value}.`)
    } else {
      setOpponentScore(prev => prev + currentQuestion.point_value)
      setFeedback(`❌ Incorrect. Correct answer: ${currentQuestion.correct_answer}`)
    }

    setAnsweredPositions(prev => [...prev, currentPosition])
    setSelectedPositions(prev => prev.filter(pos => pos !== currentPosition))

    if (answeredPositions.length + 1 === totalQuestions) {
      setGamePhase('completed')
      setFeedback(isCorrect ? 'Game complete! You finished with a correct answer.' : 'Game complete!')
    }

    closeQuestion()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-32 w-32 animate-spin text-blue-600 mx-auto" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error || 'User not found'}</AlertDescription>
            </Alert>
            <Button onClick={handleBackToLobby} className="w-full">
              <Home className="mr-2 h-4 w-4" />
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
          <CardContent className="p-6 text-center space-y-4">
            <Trophy className="h-16 w-16 text-yellow-600 mx-auto" />
            <h2 className="text-2xl font-bold">Test Match Complete</h2>
            <div className="space-y-1">
              <p className="font-semibold">Final Score</p>
              <p>{user.displayName || user.username}: ${playerScore}</p>
              <p>{opponent.displayName}: ${opponentScore}</p>
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
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="container mx-auto max-w-7xl space-y-6">
        <ScoreDisplay
          player1={{
            id: user.id,
            username: user.username,
            displayName: user.displayName || user.username,
            avatarUrl: user.avatarUrl,
            score: playerScore,
            eloRating: user.eloRating,
            isCurrentPlayer: true
          }}
          player2={{
            id: opponent.id,
            username: opponent.username,
            displayName: opponent.displayName || opponent.username,
            avatarUrl: opponent.avatarUrl,
            score: opponentScore,
            eloRating: opponent.eloRating,
            isCurrentPlayer: false
          }}
          currentTurnPlayerId={user.id}
          questionsRemaining={questionsRemaining}
          gamePhase={gamePhase}
        />

        <Card className="bg-white">
          <CardContent className="p-4 space-y-3">
            <h2 className="text-lg font-semibold">Test Match Controls</h2>
            <p className="text-sm text-muted-foreground">
              This deterministic match lets you exercise the game UI without another player.
              Select questions, submit answers, and watch the scoreboard update.
            </p>
            {feedback && (
              <Alert>
                <AlertDescription>{feedback}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <GameBoard
          questions={questions}
          categories={categories}
          selectedQuestions={new Set(selectedPositions)}
          answeredQuestions={new Set(answeredPositions)}
          currentPlayerTurn={user.id}
          currentPlayerId={user.id}
          onQuestionSelect={handleQuestionSelect}
        />

        <QuestionCard
          question={currentQuestion}
          categoryName={currentQuestion?.category_id || ''}
          pointValue={currentQuestion?.point_value || 0}
          isOpen={questionOpen && !!currentQuestion}
          onClose={closeQuestion}
          buzzerEnabled
          buzzerWinner={user.id}
          timeRemaining={5000}
          onBuzzerPress={() => {}}
          onAnswerSubmit={handleAnswerSubmit}
          isAnswering={false}
          currentPlayerId={user.id}
          playerNames={{
            [user.id]: user.displayName || user.username,
            [opponent.id]: opponent.displayName || opponent.username
          }}
        />

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleBackToLobby}>
            <Home className="mr-2 h-4 w-4" />
            Back to Lobby
          </Button>
        </div>
      </div>
    </div>
  )
}
