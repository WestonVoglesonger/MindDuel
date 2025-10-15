#!/usr/bin/env tsx

import { getSupabaseClient } from '../src/lib/supabase/universal-client'
import { generateAnswerVariants } from '../src/lib/utils/answer-matcher'

// Sample J-Archive data structure
interface JArchiveQuestion {
  id: string
  category: string
  value: number
  question: string
  answer: string
  round: string
  show_number: number
  air_date: string
}

// Expanded sample questions data
const sampleQuestions: JArchiveQuestion[] = [
  // History questions
  {
    id: "1",
    category: "HISTORY",
    value: 200,
    question: "This ancient wonder was a lighthouse built in Alexandria, Egypt",
    answer: "The Lighthouse of Alexandria",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "2", 
    category: "HISTORY",
    value: 400,
    question: "This war ended in 1945 with the dropping of atomic bombs",
    answer: "World War II",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "3",
    category: "HISTORY",
    value: 600,
    question: "This Roman emperor built a wall across northern England",
    answer: "Hadrian",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "4",
    category: "HISTORY",
    value: 800,
    question: "This French queen was executed during the French Revolution",
    answer: "Marie Antoinette",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "5",
    category: "HISTORY",
    value: 1000,
    question: "This ancient city was destroyed by Mount Vesuvius in 79 AD",
    answer: "Pompeii",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },

  // Science questions
  {
    id: "6",
    category: "SCIENCE",
    value: 200,
    question: "This gas makes up about 78% of Earth's atmosphere",
    answer: "Nitrogen",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "7",
    category: "SCIENCE", 
    value: 400,
    question: "This is the chemical symbol for gold",
    answer: "Au",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "8",
    category: "SCIENCE",
    value: 600,
    question: "This is the speed of light in a vacuum",
    answer: "299,792,458 meters per second",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "9",
    category: "SCIENCE",
    value: 800,
    question: "This is the hardest natural substance on Earth",
    answer: "Diamond",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "10",
    category: "SCIENCE",
    value: 1000,
    question: "This is the process by which plants convert sunlight into energy",
    answer: "Photosynthesis",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },

  // Literature questions
  {
    id: "11",
    category: "LITERATURE",
    value: 200,
    question: "This author wrote 'To Kill a Mockingbird'",
    answer: "Harper Lee",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "12",
    category: "LITERATURE",
    value: 400,
    question: "This is the first book in J.K. Rowling's Harry Potter series",
    answer: "Harry Potter and the Philosopher's Stone",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "13",
    category: "LITERATURE",
    value: 600,
    question: "This Shakespeare play features the character Hamlet",
    answer: "Hamlet",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "14",
    category: "LITERATURE",
    value: 800,
    question: "This author wrote '1984'",
    answer: "George Orwell",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "15",
    category: "LITERATURE",
    value: 1000,
    question: "This is the longest novel ever written",
    answer: "In Search of Lost Time",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },

  // Geography questions
  {
    id: "16",
    category: "GEOGRAPHY",
    value: 200,
    question: "This is the largest country in the world by area",
    answer: "Russia",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "17",
    category: "GEOGRAPHY",
    value: 400,
    question: "This is the longest river in the world",
    answer: "The Nile",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "18",
    category: "GEOGRAPHY",
    value: 600,
    question: "This is the smallest country in the world",
    answer: "Vatican City",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "19",
    category: "GEOGRAPHY",
    value: 800,
    question: "This is the highest mountain in the world",
    answer: "Mount Everest",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "20",
    category: "GEOGRAPHY",
    value: 1000,
    question: "This is the deepest ocean trench in the world",
    answer: "Mariana Trench",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },

  // Sports questions
  {
    id: "21",
    category: "SPORTS",
    value: 200,
    question: "This sport is played on a court with a net",
    answer: "Tennis",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "22",
    category: "SPORTS",
    value: 400,
    question: "This is the number of players on a basketball team",
    answer: "Five",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "23",
    category: "SPORTS",
    value: 600,
    question: "This is the distance of a marathon in miles",
    answer: "26.2",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "24",
    category: "SPORTS",
    value: 800,
    question: "This is the most popular sport in the world",
    answer: "Soccer",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "25",
    category: "SPORTS",
    value: 1000,
    question: "This is the only sport played on the moon",
    answer: "Golf",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },

  // Movies questions
  {
    id: "26",
    category: "MOVIES",
    value: 200,
    question: "This movie features the line 'May the Force be with you'",
    answer: "Star Wars",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "27",
    category: "MOVIES",
    value: 400,
    question: "This is the highest-grossing movie of all time",
    answer: "Avatar",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "28",
    category: "MOVIES",
    value: 600,
    question: "This director made 'Citizen Kane'",
    answer: "Orson Welles",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "29",
    category: "MOVIES",
    value: 800,
    question: "This is the first animated feature film",
    answer: "Snow White and the Seven Dwarfs",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "30",
    category: "MOVIES",
    value: 1000,
    question: "This is the only silent film to win Best Picture",
    answer: "The Artist",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },

  // Music questions
  {
    id: "31",
    category: "MUSIC",
    value: 200,
    question: "This is the most streamed song on Spotify",
    answer: "Blinding Lights",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "32",
    category: "MUSIC",
    value: 400,
    question: "This is the best-selling album of all time",
    answer: "Thriller",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "33",
    category: "MUSIC",
    value: 600,
    question: "This composer wrote 'The Four Seasons'",
    answer: "Antonio Vivaldi",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "34",
    category: "MUSIC",
    value: 800,
    question: "This is the most expensive musical instrument ever sold",
    answer: "Stradivarius violin",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "35",
    category: "MUSIC",
    value: 1000,
    question: "This is the longest song ever recorded",
    answer: "The Rise and Fall of Bossanova",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  }
]

async function importJArchiveQuestions() {
  const supabase = await getSupabaseClient()
  
  console.log('Starting J-Archive question import...')
  
  try {
    // First, create categories
    const categoryMap = new Map<string, string>()
    
    for (const question of sampleQuestions) {
      if (!categoryMap.has(question.category)) {
        const { data: category, error } = await supabase
          .from('categories')
          .insert({
            name: question.category,
            description: `Questions about ${question.category.toLowerCase()}`
          })
          .select()
          .single()
        
        if (error) {
          console.error(`Error creating category ${question.category}:`, error)
          continue
        }
        
        if (category) {
          categoryMap.set(question.category, category.id)
        }
      }
    }
    
    console.log(`Created ${categoryMap.size} categories`)
    
    // Now import questions
    let importedCount = 0
    let errorCount = 0
    
    for (const question of sampleQuestions) {
      try {
        const categoryId = categoryMap.get(question.category)
        if (!categoryId) {
          console.error(`Category not found for question: ${question.id}`)
          errorCount++
          continue
        }
        
        // Generate answer variants for fuzzy matching
        const answerVariants = generateAnswerVariants(question.answer)
        
        // Determine difficulty based on value
        let difficulty: 'easy' | 'medium' | 'hard'
        if (question.value <= 400) {
          difficulty = 'easy'
        } else if (question.value <= 800) {
          difficulty = 'medium'
        } else {
          difficulty = 'hard'
        }
        
        const { data, error } = await supabase
          .from('questions')
          .insert({
            category_id: categoryId,
            question_text: question.question,
            correct_answer: question.answer,
            answer_variants: answerVariants,
            point_value: question.value,
            difficulty: difficulty,
            air_date: question.air_date,
            source: 'J-Archive'
          })
          .select()
          .single()
        
        if (error) {
          console.error(`Error importing question ${question.id}:`, error)
          errorCount++
        } else {
          importedCount++
          console.log(`Imported question: ${question.question.substring(0, 50)}...`)
        }
      } catch (error) {
        console.error(`Unexpected error importing question ${question.id}:`, error)
        errorCount++
      }
    }
    
    console.log(`Import completed!`)
    console.log(`- Successfully imported: ${importedCount} questions`)
    console.log(`- Errors: ${errorCount} questions`)
    console.log(`- Categories created: ${categoryMap.size}`)
    
    return {
      success: true,
      importedCount,
      errorCount,
      categoryCount: categoryMap.size
    }
    
  } catch (error) {
    console.error('Fatal error during import:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function main() {
  console.log('🚀 Starting MindDuel question import...')
  
  const result = await importJArchiveQuestions()
  
  if (result.success) {
    console.log('✅ Import completed successfully!')
    console.log(`📊 Statistics:`)
    console.log(`   - Questions imported: ${result.importedCount}`)
    console.log(`   - Categories created: ${result.categoryCount}`)
    console.log(`   - Errors: ${result.errorCount}`)
  } else {
    console.error('❌ Import failed:', result.error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
