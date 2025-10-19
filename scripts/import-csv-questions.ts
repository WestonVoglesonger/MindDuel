import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'

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

export async function importCSVQuestions() {
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

  console.log('Starting CSV question import...')

  try {
    // Read CSV file
    const csvContent = readFileSync('./questions-import.csv', 'utf-8')
    const records: QuestionData[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    })

    console.log(`Found ${records.length} questions to import`)

    // First, create or get categories
    const categoryMap = new Map<string, string>()

    for (const record of records) {
      if (!categoryMap.has(record.category_name)) {
        // Check if category exists
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', record.category_name)
          .single()

        if (existingCategory) {
          categoryMap.set(record.category_name, existingCategory.id)
          console.log(`Found existing category: ${record.category_name}`)
        } else {
          // Create new category
          const { data: newCategory, error } = await supabase
            .from('categories')
            .insert({
              name: record.category_name,
              description: `Questions about ${record.category_name.toLowerCase()}`
            })
            .select()
            .single()

          if (error) {
            console.error(`Error creating category ${record.category_name}:`, error)
            continue
          }

          if (newCategory) {
            categoryMap.set(record.category_name, newCategory.id)
            console.log(`Created new category: ${record.category_name}`)
          }
        }
      }
    }

    console.log(`Mapped ${categoryMap.size} categories`)

    // Now import questions
    let importedCount = 0
    let errorCount = 0

    for (const record of records) {
      try {
        const categoryId = categoryMap.get(record.category_name)
        if (!categoryId) {
          console.error(`Category not found for question: ${record.question_text}`)
          errorCount++
          continue
        }

        // Generate answer variants for fuzzy matching
        const answerVariants = generateAnswerVariants(record.correct_answer)

        // Insert question
        const { data: question, error } = await supabase
          .from('questions')
          .insert({
            category_id: categoryId,
            question_text: record.question_text,
            correct_answer: record.correct_answer,
            answer_variants: answerVariants,
            point_value: record.point_value,
            difficulty: record.difficulty,
            air_date: record.air_date || null,
            source: record.source || 'CSV Import'
          })
          .select()
          .single()

        if (error) {
          console.error(`Error importing question "${record.question_text}":`, error)
          errorCount++
        } else {
          console.log(`Imported question: ${record.question_text}`)
          importedCount++
        }
      } catch (err) {
        console.error(`Error processing question "${record.question_text}":`, err)
        errorCount++
      }
    }

    console.log(`Import completed!`)
    console.log(`- Successfully imported: ${importedCount} questions`)
    console.log(`- Errors: ${errorCount} questions`)
    console.log(`- Categories mapped: ${categoryMap.size}`)

    return {
      success: true,
      importedCount,
      errorCount,
      categoryCount: categoryMap.size
    }
  } catch (error) {
    console.error('Import failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      importedCount: 0,
      errorCount: 0,
      categoryCount: 0
    }
  }
}

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
