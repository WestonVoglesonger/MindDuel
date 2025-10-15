import { createClient } from '@/lib/supabase/server'
import { generateAnswerVariants } from '@/lib/utils/answer-matcher'

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

// Sample questions data (in a real implementation, this would be loaded from a CSV/JSON file)
const sampleQuestions: JArchiveQuestion[] = [
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
    category: "SCIENCE",
    value: 200,
    question: "This gas makes up about 78% of Earth's atmosphere",
    answer: "Nitrogen",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "4",
    category: "SCIENCE", 
    value: 400,
    question: "This is the chemical symbol for gold",
    answer: "Au",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "5",
    category: "LITERATURE",
    value: 200,
    question: "This author wrote 'To Kill a Mockingbird'",
    answer: "Harper Lee",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "6",
    category: "LITERATURE",
    value: 400,
    question: "This is the first book in J.K. Rowling's Harry Potter series",
    answer: "Harry Potter and the Philosopher's Stone",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "7",
    category: "GEOGRAPHY",
    value: 200,
    question: "This is the largest country in the world by area",
    answer: "Russia",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "8",
    category: "GEOGRAPHY",
    value: 400,
    question: "This is the longest river in the world",
    answer: "The Nile",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "9",
    category: "SPORTS",
    value: 200,
    question: "This sport is played on a court with a net",
    answer: "Tennis",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  },
  {
    id: "10",
    category: "SPORTS",
    value: 400,
    question: "This is the number of players on a basketball team",
    answer: "Five",
    round: "Jeopardy!",
    show_number: 1,
    air_date: "1964-03-30"
  }
]

export async function importJArchiveQuestions() {
  const supabase = await createClient()
  
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

// Function to load questions from CSV file (for real implementation)
export async function loadQuestionsFromCSV(filePath: string): Promise<JArchiveQuestion[]> {
  // In a real implementation, you would:
  // 1. Read the CSV file
  // 2. Parse it using a CSV parser like 'csv-parser'
  // 3. Transform the data to match JArchiveQuestion interface
  // 4. Return the parsed questions
  
  // For now, return sample data
  return sampleQuestions
}

// Function to validate question data
export function validateQuestionData(question: JArchiveQuestion): boolean {
  return !!(
    question.id &&
    question.category &&
    question.value &&
    question.question &&
    question.answer &&
    question.air_date
  )
}

// Function to clean and normalize question text
export function cleanQuestionText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s.,!?'"-]/g, '') // Remove special characters except basic punctuation
}

// Function to clean and normalize answer text
export function cleanAnswerText(text: string): string {
  return text
    .trim()
    .replace(/^(who is|what is|where is|when is|why is|how is|who was|what was|where was|when was|why was|how was|who are|what are|where are|when are|why are|how are)\s+/i, '') // Remove common prefixes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s.,!?'"-]/g, '') // Remove special characters except basic punctuation
}
