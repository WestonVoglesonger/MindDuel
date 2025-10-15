import { getSupabaseClient } from '@/lib/supabase/universal-client'
import { Question, Category } from '@/types/game.types'

type QuestionInsert = {
  category_id: string
  question_text: string
  correct_answer: string
  answer_variants?: string[]
  point_value: number
  difficulty?: 'easy' | 'medium' | 'hard'
  air_date?: string
  source?: string
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

/**
 * Get category by ID
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return data
}

/**
 * Get questions by category
 */
export async function getQuestionsByCategory(categoryId: string): Promise<Question[]> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category_id', categoryId)
    .order('point_value')

  if (error) {
    console.error('Error fetching questions by category:', error)
    return []
  }

  return data || []
}

/**
 * Get random questions for a game
 */
export async function getRandomQuestions(count: number, difficulty?: 'easy' | 'medium' | 'hard'): Promise<Question[]> {
  const supabase = await getSupabaseClient()
  
  let query = supabase
    .from('questions')
    .select('*')
    .order('random()')
    .limit(count)

  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching random questions:', error)
    return []
  }

  return data || []
}

/**
 * Get questions by IDs
 */
export async function getQuestionsByIds(questionIds: string[]): Promise<Question[]> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .in('id', questionIds)

  if (error) {
    console.error('Error fetching questions by IDs:', error)
    return []
  }

  return data || []
}

/**
 * Get questions for a specific game board (5x5 grid)
 * Selects 5 questions from each of 5 different categories
 */
export async function getQuestionsForGameBoard(): Promise<Question[]> {
  const supabase = await getSupabaseClient()
  
  // Get 5 random categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id')
    .order('random()')
    .limit(5)

  if (categoriesError) {
    console.error('Error fetching categories for game board:', categoriesError)
    return []
  }

  if (!categories || categories.length < 5) {
    console.error('Not enough categories available')
    return []
  }

  // Get 5 questions from each category (one for each point value)
  const questions: Question[] = []
  const pointValues = [200, 400, 600, 800, 1000]

  for (let i = 0; i < 5; i++) {
    const categoryId = categories[i].id
    
    for (const pointValue of pointValues) {
      const { data: question, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category_id', categoryId)
        .eq('point_value', pointValue)
        .order('random()')
        .limit(1)
        .single()

      if (error) {
        console.error(`Error fetching question for category ${categoryId}, point value ${pointValue}:`, error)
        continue
      }

      if (question) {
        questions.push(question)
      }
    }
  }

  return questions
}

/**
 * Create a new category
 */
export async function createCategory(name: string, description?: string): Promise<Category | null> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, description })
    .select()
    .single()

  if (error) {
    console.error('Error creating category:', error)
    return null
  }

  return data
}

/**
 * Create a new question
 */
export async function createQuestion(questionData: QuestionInsert): Promise<Question | null> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('questions')
    .insert(questionData)
    .select()
    .single()

  if (error) {
    console.error('Error creating question:', error)
    return null
  }

  return data
}

/**
 * Get question by ID
 */
export async function getQuestionById(questionId: string): Promise<Question | null> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single()

  if (error) {
    console.error('Error fetching question:', error)
    return null
  }

  return data
}

/**
 * Get total question count
 */
export async function getQuestionCount(): Promise<number> {
  const supabase = await getSupabaseClient()
  
  const { count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error fetching question count:', error)
    return 0
  }

  return count || 0
}

/**
 * Get questions by difficulty
 */
export async function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard', limit: number = 50): Promise<Question[]> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('difficulty', difficulty)
    .order('random()')
    .limit(limit)

  if (error) {
    console.error('Error fetching questions by difficulty:', error)
    return []
  }

  return data || []
}
