import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

interface QuestionData {
  category_name: string
  question_text: string
  correct_answer: string
  point_value: number
  difficulty: 'easy' | 'medium' | 'hard'
  air_date?: string
  source?: string
}

// Expanded question set for better game variety
const manualQuestions: QuestionData[] = [
  // HISTORY (Easy)
  {
    category_name: "HISTORY",
    question_text: "This wall was built to protect China from invaders",
    correct_answer: "The Great Wall of China",
    point_value: 200,
    difficulty: "easy",
    source: "Manual"
  },
  {
    category_name: "HISTORY",
    question_text: "This ship sank in 1912 after hitting an iceberg",
    correct_answer: "The Titanic",
    point_value: 400,
    difficulty: "easy",
    source: "Manual"
  },
  {
    category_name: "HISTORY",
    question_text: "This document was signed in 1776 declaring independence",
    correct_answer: "The Declaration of Independence",
    point_value: 600,
    difficulty: "medium",
    source: "Manual"
  },

  // SCIENCE (Easy-Medium)
  {
    category_name: "SCIENCE",
    question_text: "This planet is known as the Red Planet",
    correct_answer: "Mars",
    point_value: 200,
    difficulty: "easy",
    source: "Manual"
  },
  {
    category_name: "SCIENCE",
    question_text: "This element has the chemical symbol 'O'",
    correct_answer: "Oxygen",
    point_value: 400,
    difficulty: "easy",
    source: "Manual"
  },
  {
    category_name: "SCIENCE",
    question_text: "This scientist developed the theory of evolution",
    correct_answer: "Charles Darwin",
    point_value: 800,
    difficulty: "medium",
    source: "Manual"
  },

  // LITERATURE (Easy-Medium)
  {
    category_name: "LITERATURE",
    question_text: "This Shakespeare play features the character Hamlet",
    correct_answer: "Hamlet",
    point_value: 400,
    difficulty: "easy",
    source: "Manual"
  },
  {
    category_name: "LITERATURE",
    question_text: "This author wrote 'Pride and Prejudice'",
    correct_answer: "Jane Austen",
    point_value: 600,
    difficulty: "medium",
    source: "Manual"
  },
  {
    category_name: "LITERATURE",
    question_text: "This epic poem by Homer tells the story of the Trojan War",
    correct_answer: "The Iliad",
    point_value: 1000,
    difficulty: "hard",
    source: "Manual"
  },

  // GEOGRAPHY (Easy-Medium)
  {
    category_name: "GEOGRAPHY",
    question_text: "This is the capital city of France",
    correct_answer: "Paris",
    point_value: 200,
    difficulty: "easy",
    source: "Manual"
  },
  {
    category_name: "GEOGRAPHY",
    question_text: "This mountain range runs along the border between Europe and Asia",
    correct_answer: "The Ural Mountains",
    point_value: 600,
    difficulty: "medium",
    source: "Manual"
  },
  {
    category_name: "GEOGRAPHY",
    question_text: "This African country was formerly known as Abyssinia",
    correct_answer: "Ethiopia",
    point_value: 800,
    difficulty: "medium",
    source: "Manual"
  },

  // SPORTS (Easy-Medium)
  {
    category_name: "SPORTS",
    question_text: "This sport is often called 'America's Pastime'",
    correct_answer: "Baseball",
    point_value: 400,
    difficulty: "easy",
    source: "Manual"
  },
  {
    category_name: "SPORTS",
    question_text: "This tennis tournament is held annually in England",
    correct_answer: "Wimbledon",
    point_value: 600,
    difficulty: "medium",
    source: "Manual"
  },
  {
    category_name: "SPORTS",
    question_text: "This NFL team has won the most Super Bowls",
    correct_answer: "Pittsburgh Steelers",
    point_value: 800,
    difficulty: "medium",
    source: "Manual"
  },

  // ADDITIONAL CATEGORIES

  // MOVIES (Easy-Medium)
  {
    category_name: "MOVIES",
    question_text: "This 1939 film features the line 'Toto, I've a feeling we're not in Kansas anymore'",
    correct_answer: "The Wizard of Oz",
    point_value: 600,
    difficulty: "medium",
    source: "Manual"
  },
  {
    category_name: "MOVIES",
    question_text: "This actor played the Joker in 'The Dark Knight'",
    correct_answer: "Heath Ledger",
    point_value: 800,
    difficulty: "medium",
    source: "Manual"
  },

  // MUSIC (Easy-Medium)
  {
    category_name: "MUSIC",
    question_text: "This Beatles album is often called 'The White Album'",
    correct_answer: "The Beatles",
    point_value: 600,
    difficulty: "medium",
    source: "Manual"
  },
  {
    category_name: "MUSIC",
    question_text: "This composer wrote 'The Four Seasons'",
    correct_answer: "Antonio Vivaldi",
    point_value: 800,
    difficulty: "medium",
    source: "Manual"
  },

  // FOOD (Easy)
  {
    category_name: "FOOD",
    question_text: "This Italian dish consists of thin pasta with tomato sauce and cheese",
    correct_answer: "Spaghetti",
    point_value: 400,
    difficulty: "easy",
    source: "Manual"
  },
  {
    category_name: "FOOD",
    question_text: "This spice is made from the Crocus flower and is very expensive",
    correct_answer: "Saffron",
    point_value: 800,
    difficulty: "medium",
    source: "Manual"
  },

  // TECHNOLOGY (Medium-Hard)
  {
    category_name: "TECHNOLOGY",
    question_text: "This company created the iPhone",
    correct_answer: "Apple",
    point_value: 400,
    difficulty: "easy",
    source: "Manual"
  },
  {
    category_name: "TECHNOLOGY",
    question_text: "This programming language was created by Guido van Rossum",
    correct_answer: "Python",
    point_value: 600,
    difficulty: "medium",
    source: "Manual"
  },
  {
    category_name: "TECHNOLOGY",
    question_text: "This computer scientist is known as the 'father of the World Wide Web'",
    correct_answer: "Tim Berners-Lee",
    point_value: 1000,
    difficulty: "hard",
    source: "Manual"
  },

  // ANIMALS (Easy-Medium)
  {
    category_name: "ANIMALS",
    question_text: "This is the largest mammal in the world",
    correct_answer: "Blue Whale",
    point_value: 400,
    difficulty: "easy",
    source: "Manual"
  },
  {
    category_name: "ANIMALS",
    question_text: "This bird cannot fly but can run up to 70 mph",
    correct_answer: "Ostrich",
    point_value: 600,
    difficulty: "medium",
    source: "Manual"
  }
]

// Simple answer variant generator
function generateAnswerVariants(answer: string): string[] {
  const variants = [answer]

  // Add lowercase version
  variants.push(answer.toLowerCase())

  // Add common variations (for names, etc.)
  if (answer.includes(' ')) {
    variants.push(answer.split(' ').reverse().join(' '))
  }

  // Add some common typos or variations
  const commonVariations = [
    answer.replace(/'/g, ''),
    answer.replace(/"/g, ''),
    answer.replace(/[^\w\s]/g, ''),
  ]

  variants.push(...commonVariations)

  // Return unique variants, limited to reasonable number
  return [...new Set(variants)].slice(0, 10)
}

export async function addManualQuestions() {
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

  console.log('🚀 Starting manual question import...')
  console.log(`📊 Adding ${manualQuestions.length} questions across ${new Set(manualQuestions.map(q => q.category_name)).size} categories`)

  try {
    // First, create or get categories
    const categoryMap = new Map<string, string>()

    for (const question of manualQuestions) {
      if (!categoryMap.has(question.category_name)) {
        // Check if category exists
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', question.category_name)
          .single()

        if (existingCategory) {
          categoryMap.set(question.category_name, existingCategory.id)
          console.log(`✅ Found existing category: ${question.category_name}`)
        } else {
          // Create new category
          const { data: newCategory, error } = await supabase
            .from('categories')
            .insert({
              name: question.category_name,
              description: `Questions about ${question.category_name.toLowerCase()}`
            })
            .select()
            .single()

          if (error) {
            console.error(`❌ Error creating category ${question.category_name}:`, error)
            continue
          }

          if (newCategory) {
            categoryMap.set(question.category_name, newCategory.id)
            console.log(`✅ Created new category: ${question.category_name}`)
          }
        }
      }
    }

    console.log(`📂 Mapped ${categoryMap.size} categories`)

    // Now import questions
    let importedCount = 0
    let errorCount = 0

    for (const question of manualQuestions) {
      try {
        const categoryId = categoryMap.get(question.category_name)
        if (!categoryId) {
          console.error(`❌ Category not found for question: ${question.question_text}`)
          errorCount++
          continue
        }

        // Generate answer variants for fuzzy matching
        const answerVariants = generateAnswerVariants(question.correct_answer)

        // Insert question
        const { data: insertedQuestion, error } = await supabase
          .from('questions')
          .insert({
            category_id: categoryId,
            question_text: question.question_text,
            correct_answer: question.correct_answer,
            answer_variants: answerVariants,
            point_value: question.point_value,
            difficulty: question.difficulty,
            air_date: question.air_date || null,
            source: question.source || 'Manual Import'
          })
          .select()
          .single()

        if (error) {
          console.error(`❌ Error importing question "${question.question_text}":`, error)
          errorCount++
        } else {
          console.log(`✅ Imported: ${question.question_text.substring(0, 50)}...`)
          importedCount++
        }
      } catch (err) {
        console.error(`❌ Error processing question "${question.question_text}":`, err)
        errorCount++
      }
    }

    console.log(`🎉 Import completed!`)
    console.log(`📊 Statistics:`)
    console.log(`   ✅ Questions imported: ${importedCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📂 Categories created: ${categoryMap.size}`)

    return {
      success: true,
      importedCount,
      errorCount,
      categoryCount: categoryMap.size
    }
  } catch (error) {
    console.error('💥 Import failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      importedCount: 0,
      errorCount: 0,
      categoryCount: 0
    }
  }
}
