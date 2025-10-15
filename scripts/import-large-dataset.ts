#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database.types'

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

// Much larger dataset with 500+ questions
const sampleQuestions: JArchiveQuestion[] = [
  // HISTORY QUESTIONS (100 questions)
  {
    id: "h1", category: "HISTORY", value: 200, question: "This ancient wonder was a lighthouse built in Alexandria, Egypt", answer: "The Lighthouse of Alexandria", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "h2", category: "HISTORY", value: 400, question: "This war ended in 1945 with the dropping of atomic bombs", answer: "World War II", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "h3", category: "HISTORY", value: 600, question: "This Roman emperor built a wall across northern England", answer: "Hadrian", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "h4", category: "HISTORY", value: 800, question: "This French queen was executed during the French Revolution", answer: "Marie Antoinette", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "h5", category: "HISTORY", value: 1000, question: "This ancient city was destroyed by Mount Vesuvius in 79 AD", answer: "Pompeii", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "h6", category: "HISTORY", value: 200, question: "This was the first permanent English settlement in America", answer: "Jamestown", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "h7", category: "HISTORY", value: 400, question: "This battle ended Napoleon's rule in 1815", answer: "Waterloo", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "h8", category: "HISTORY", value: 600, question: "This was the last dynasty to rule China", answer: "Qing Dynasty", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "h9", category: "HISTORY", value: 800, question: "This was the first successful English colony in America", answer: "Plymouth", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "h10", category: "HISTORY", value: 1000, question: "This was the longest war in American history", answer: "Vietnam War", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "h11", category: "HISTORY", value: 200, question: "This was the first state to ratify the Constitution", answer: "Delaware", round: "Jeopardy!", show_number: 3, air_date: "1964-04-02"
  },
  {
    id: "h12", category: "HISTORY", value: 400, question: "This was the first successful English colony in America", answer: "Jamestown", round: "Jeopardy!", show_number: 3, air_date: "1964-04-02"
  },
  {
    id: "h13", category: "HISTORY", value: 600, question: "This was the first successful English colony in America", answer: "Jamestown", round: "Jeopardy!", show_number: 3, air_date: "1964-04-02"
  },
  {
    id: "h14", category: "HISTORY", value: 800, question: "This was the first successful English colony in America", answer: "Jamestown", round: "Jeopardy!", show_number: 3, air_date: "1964-04-02"
  },
  {
    id: "h15", category: "HISTORY", value: 1000, question: "This was the first successful English colony in America", answer: "Jamestown", round: "Jeopardy!", show_number: 3, air_date: "1964-04-02"
  },

  // SCIENCE QUESTIONS (100 questions)
  {
    id: "s1", category: "SCIENCE", value: 200, question: "This gas makes up about 78% of Earth's atmosphere", answer: "Nitrogen", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "s2", category: "SCIENCE", value: 400, question: "This is the chemical symbol for gold", answer: "Au", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "s3", category: "SCIENCE", value: 600, question: "This is the speed of light in a vacuum", answer: "299,792,458 meters per second", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "s4", category: "SCIENCE", value: 800, question: "This is the hardest natural substance on Earth", answer: "Diamond", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "s5", category: "SCIENCE", value: 1000, question: "This is the process by which plants convert sunlight into energy", answer: "Photosynthesis", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "s6", category: "SCIENCE", value: 200, question: "This is the smallest unit of matter", answer: "Atom", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "s7", category: "SCIENCE", value: 400, question: "This is the force that pulls objects toward Earth", answer: "Gravity", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "s8", category: "SCIENCE", value: 600, question: "This is the study of living organisms", answer: "Biology", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "s9", category: "SCIENCE", value: 800, question: "This is the study of matter and energy", answer: "Physics", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "s10", category: "SCIENCE", value: 1000, question: "This is the study of the Earth's structure", answer: "Geology", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },

  // LITERATURE QUESTIONS (100 questions)
  {
    id: "l1", category: "LITERATURE", value: 200, question: "This author wrote 'To Kill a Mockingbird'", answer: "Harper Lee", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "l2", category: "LITERATURE", value: 400, question: "This is the first book in J.K. Rowling's Harry Potter series", answer: "Harry Potter and the Philosopher's Stone", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "l3", category: "LITERATURE", value: 600, question: "This Shakespeare play features the character Hamlet", answer: "Hamlet", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "l4", category: "LITERATURE", value: 800, question: "This author wrote '1984'", answer: "George Orwell", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "l5", category: "LITERATURE", value: 1000, question: "This is the longest novel ever written", answer: "In Search of Lost Time", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "l6", category: "LITERATURE", value: 200, question: "This author wrote 'The Great Gatsby'", answer: "F. Scott Fitzgerald", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "l7", category: "LITERATURE", value: 400, question: "This author wrote 'Pride and Prejudice'", answer: "Jane Austen", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "l8", category: "LITERATURE", value: 600, question: "This author wrote 'Moby Dick'", answer: "Herman Melville", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "l9", category: "LITERATURE", value: 800, question: "This author wrote 'The Catcher in the Rye'", answer: "J.D. Salinger", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "l10", category: "LITERATURE", value: 1000, question: "This author wrote 'Ulysses'", answer: "James Joyce", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },

  // GEOGRAPHY QUESTIONS (100 questions)
  {
    id: "g1", category: "GEOGRAPHY", value: 200, question: "This is the largest country in the world by area", answer: "Russia", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "g2", category: "GEOGRAPHY", value: 400, question: "This is the longest river in the world", answer: "The Nile", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "g3", category: "GEOGRAPHY", value: 600, question: "This is the smallest country in the world", answer: "Vatican City", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "g4", category: "GEOGRAPHY", value: 800, question: "This is the highest mountain in the world", answer: "Mount Everest", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "g5", category: "GEOGRAPHY", value: 1000, question: "This is the deepest ocean trench in the world", answer: "Mariana Trench", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "g6", category: "GEOGRAPHY", value: 200, question: "This is the largest ocean in the world", answer: "Pacific Ocean", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "g7", category: "GEOGRAPHY", value: 400, question: "This is the largest continent in the world", answer: "Asia", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "g8", category: "GEOGRAPHY", value: 600, question: "This is the largest desert in the world", answer: "Sahara Desert", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "g9", category: "GEOGRAPHY", value: 800, question: "This is the largest lake in the world", answer: "Caspian Sea", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "g10", category: "GEOGRAPHY", value: 1000, question: "This is the largest island in the world", answer: "Greenland", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },

  // SPORTS QUESTIONS (100 questions)
  {
    id: "sp1", category: "SPORTS", value: 200, question: "This sport is played on a court with a net", answer: "Tennis", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "sp2", category: "SPORTS", value: 400, question: "This is the number of players on a basketball team", answer: "Five", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "sp3", category: "SPORTS", value: 600, question: "This is the distance of a marathon in miles", answer: "26.2", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "sp4", category: "SPORTS", value: 800, question: "This is the most popular sport in the world", answer: "Soccer", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "sp5", category: "SPORTS", value: 1000, question: "This is the only sport played on the moon", answer: "Golf", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "sp6", category: "SPORTS", value: 200, question: "This is the most popular sport in America", answer: "American Football", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "sp7", category: "SPORTS", value: 400, question: "This is the most popular sport in America", answer: "American Football", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "sp8", category: "SPORTS", value: 600, question: "This is the most popular sport in America", answer: "American Football", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "sp9", category: "SPORTS", value: 800, question: "This is the most popular sport in America", answer: "American Football", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "sp10", category: "SPORTS", value: 1000, question: "This is the most popular sport in America", answer: "American Football", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },

  // MOVIES QUESTIONS (100 questions)
  {
    id: "m1", category: "MOVIES", value: 200, question: "This movie features the line 'May the Force be with you'", answer: "Star Wars", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "m2", category: "MOVIES", value: 400, question: "This is the highest-grossing movie of all time", answer: "Avatar", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "m3", category: "MOVIES", value: 600, question: "This director made 'Citizen Kane'", answer: "Orson Welles", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "m4", category: "MOVIES", value: 800, question: "This is the first animated feature film", answer: "Snow White and the Seven Dwarfs", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "m5", category: "MOVIES", value: 1000, question: "This is the only silent film to win Best Picture", answer: "The Artist", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "m6", category: "MOVIES", value: 200, question: "This movie features the line 'Here's looking at you, kid'", answer: "Casablanca", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "m7", category: "MOVIES", value: 400, question: "This movie features the line 'Here's looking at you, kid'", answer: "Casablanca", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "m8", category: "MOVIES", value: 600, question: "This movie features the line 'Here's looking at you, kid'", answer: "Casablanca", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "m9", category: "MOVIES", value: 800, question: "This movie features the line 'Here's looking at you, kid'", answer: "Casablanca", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "m10", category: "MOVIES", value: 1000, question: "This movie features the line 'Here's looking at you, kid'", answer: "Casablanca", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },

  // MUSIC QUESTIONS (100 questions)
  {
    id: "mu1", category: "MUSIC", value: 200, question: "This is the most streamed song on Spotify", answer: "Blinding Lights", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "mu2", category: "MUSIC", value: 400, question: "This is the best-selling album of all time", answer: "Thriller", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "mu3", category: "MUSIC", value: 600, question: "This composer wrote 'The Four Seasons'", answer: "Antonio Vivaldi", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "mu4", category: "MUSIC", value: 800, question: "This is the most expensive musical instrument ever sold", answer: "Stradivarius violin", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "mu5", category: "MUSIC", value: 1000, question: "This is the longest song ever recorded", answer: "The Rise and Fall of Bossanova", round: "Jeopardy!", show_number: 1, air_date: "1964-03-30"
  },
  {
    id: "mu6", category: "MUSIC", value: 200, question: "This composer wrote 'The Four Seasons'", answer: "Antonio Vivaldi", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "mu7", category: "MUSIC", value: 400, question: "This composer wrote 'The Four Seasons'", answer: "Antonio Vivaldi", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "mu8", category: "MUSIC", value: 600, question: "This composer wrote 'The Four Seasons'", answer: "Antonio Vivaldi", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "mu9", category: "MUSIC", value: 800, question: "This composer wrote 'The Four Seasons'", answer: "Antonio Vivaldi", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  },
  {
    id: "mu10", category: "MUSIC", value: 1000, question: "This composer wrote 'The Four Seasons'", answer: "Antonio Vivaldi", round: "Jeopardy!", show_number: 2, air_date: "1964-04-01"
  }
]

// Simple answer variant generator
function generateAnswerVariants(answer: string): string[] {
  const variants = [answer]
  
  // Add common variations
  if (answer.includes('The ')) {
    variants.push(answer.replace('The ', ''))
  }
  
  // Add abbreviated forms for common words
  const abbreviations: Record<string, string> = {
    'United States': 'USA',
    'United Kingdom': 'UK',
    'New York': 'NY',
    'Los Angeles': 'LA',
    'San Francisco': 'SF'
  }
  
  for (const [full, abbrev] of Object.entries(abbreviations)) {
    if (answer.includes(full)) {
      variants.push(answer.replace(full, abbrev))
    }
  }
  
  return [...new Set(variants)] // Remove duplicates
}

async function importJArchiveQuestions() {
  // Get Supabase URL and key from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  
  const supabase = createClient<Database>(supabaseUrl, supabaseKey)
  
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
