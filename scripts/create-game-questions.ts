import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

interface GameQuestionData {
  game_session_id: string
  question_id: string
  position: number
}

export async function createGameQuestions() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('🎲 Creating game questions from question pool...')

  try {
    // Get all available questions from the questions table
    const { data: allQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('id, category_id, point_value, difficulty, question_text')
      .order('created_at')

    if (questionsError) {
      console.error('❌ Error fetching questions:', questionsError)
      return { success: false, error: questionsError.message }
    }

    console.log(`📚 Found ${allQuestions.length} questions in the pool`)

    if (allQuestions.length < 25) {
      console.error('❌ Not enough questions for a full game (need at least 25)')
      return { success: false, error: 'Insufficient questions for game board' }
    }

    // Select 25 random questions for the game board (5x5 grid)
    const selectedQuestions = allQuestions
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, 25) // Take first 25

    console.log(`🎯 Selected ${selectedQuestions.length} questions for game board`)
    console.log(`📋 Sample questions that would be used in a game:`)

    // Show sample of selected questions (without actually creating game_questions entries)
    selectedQuestions.slice(0, 10).forEach((question, index) => {
      console.log(`   Position ${index}: ${question.question_text.substring(0, 60)}... (${question.point_value} pts)`)
    })

    console.log(`\n🎲 Game questions selection complete!`)
    console.log(`📊 Summary:`)
    console.log(`   - Questions available: ${allQuestions.length}`)
    console.log(`   - Questions selected for game: ${selectedQuestions.length}`)
    console.log(`   - Categories represented: ${new Set(selectedQuestions.map(q => q.category_id)).size}`)

    return {
      success: true,
      selectedQuestionsCount: selectedQuestions.length,
      totalQuestionsInPool: allQuestions.length,
      sampleQuestions: selectedQuestions.slice(0, 5)
    }

  } catch (error) {
    console.error('💥 Game questions creation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
