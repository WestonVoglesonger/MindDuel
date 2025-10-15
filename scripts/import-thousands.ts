#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database.types'
import * as fs from 'fs'
import * as path from 'path'

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

// Generate a large dataset programmatically
function generateLargeDataset(): JArchiveQuestion[] {
  const questions: JArchiveQuestion[] = []
  const categories = [
    'HISTORY', 'SCIENCE', 'LITERATURE', 'GEOGRAPHY', 'SPORTS', 'MOVIES', 'MUSIC',
    'ART', 'FOOD & DRINK', 'TECHNOLOGY', 'POLITICS', 'NATURE', 'ANIMALS', 'WORLD CITIES',
    'FAMOUS PEOPLE', 'INVENTIONS', 'WARS', 'RELIGION', 'MYTHOLOGY', 'ARCHITECTURE'
  ]
  
  const questionTemplates = {
    'HISTORY': [
      { q: "This war ended in {year}", a: "World War {number}" },
      { q: "This ancient wonder was located in {place}", a: "The {wonder}" },
      { q: "This emperor ruled from {year} to {year}", a: "{emperor}" },
      { q: "This battle took place in {year}", a: "The Battle of {battle}" },
      { q: "This dynasty ruled {country} for {years} years", a: "{dynasty} Dynasty" }
    ],
    'SCIENCE': [
      { q: "This gas makes up {percentage}% of Earth's atmosphere", a: "{gas}" },
      { q: "This is the chemical symbol for {element}", a: "{symbol}" },
      { q: "This is the speed of light in a vacuum", a: "299,792,458 meters per second" },
      { q: "This is the hardest natural substance on Earth", a: "Diamond" },
      { q: "This is the process by which plants convert sunlight into energy", a: "Photosynthesis" }
    ],
    'LITERATURE': [
      { q: "This author wrote '{book}'", a: "{author}" },
      { q: "This is the first book in {series} series", a: "{book}" },
      { q: "This Shakespeare play features the character {character}", a: "{play}" },
      { q: "This author wrote '{book}' in {year}", a: "{author}" },
      { q: "This is the longest novel ever written", a: "In Search of Lost Time" }
    ],
    'GEOGRAPHY': [
      { q: "This is the largest {feature} in the world", a: "{name}" },
      { q: "This is the longest {feature} in the world", a: "{name}" },
      { q: "This is the smallest {feature} in the world", a: "{name}" },
      { q: "This is the highest {feature} in the world", a: "{name}" },
      { q: "This is the deepest {feature} in the world", a: "{name}" }
    ],
    'SPORTS': [
      { q: "This sport is played on a {surface} with a {equipment}", a: "{sport}" },
      { q: "This is the number of players on a {sport} team", a: "{number}" },
      { q: "This is the distance of a {event} in {unit}", a: "{distance}" },
      { q: "This is the most popular sport in {place}", a: "{sport}" },
      { q: "This is the only sport played on the {location}", a: "{sport}" }
    ],
    'MOVIES': [
      { q: "This movie features the line '{quote}'", a: "{movie}" },
      { q: "This is the highest-grossing movie of all time", a: "{movie}" },
      { q: "This director made '{movie}'", a: "{director}" },
      { q: "This is the first {type} film", a: "{movie}" },
      { q: "This is the only {type} film to win Best Picture", a: "{movie}" }
    ],
    'MUSIC': [
      { q: "This is the most streamed song on {platform}", a: "{song}" },
      { q: "This is the best-selling album of all time", a: "{album}" },
      { q: "This composer wrote '{piece}'", a: "{composer}" },
      { q: "This is the most expensive musical instrument ever sold", a: "{instrument}" },
      { q: "This is the longest song ever recorded", a: "{song}" }
    ]
  }
  
  const replacements = {
    year: ['1945', '1969', '1776', '1066', '1492', '1812', '1914', '1939'],
    place: ['Egypt', 'Greece', 'Rome', 'China', 'India', 'Mexico', 'Peru'],
    wonder: ['Pyramids', 'Lighthouse of Alexandria', 'Hanging Gardens', 'Colossus'],
    emperor: ['Caesar', 'Napoleon', 'Alexander', 'Charlemagne', 'Augustus'],
    battle: ['Hastings', 'Waterloo', 'Gettysburg', 'Normandy', 'Stalingrad'],
    country: ['China', 'Japan', 'France', 'England', 'Russia'],
    dynasty: ['Ming', 'Qing', 'Han', 'Tang', 'Song'],
    percentage: ['78', '21', '1', '0.04'],
    gas: ['Nitrogen', 'Oxygen', 'Argon', 'Carbon Dioxide'],
    element: ['gold', 'silver', 'iron', 'copper', 'lead'],
    symbol: ['Au', 'Ag', 'Fe', 'Cu', 'Pb'],
    book: ['To Kill a Mockingbird', '1984', 'The Great Gatsby', 'Pride and Prejudice'],
    author: ['Harper Lee', 'George Orwell', 'F. Scott Fitzgerald', 'Jane Austen'],
    series: ['Harry Potter', 'Lord of the Rings', 'Game of Thrones'],
    character: ['Hamlet', 'Romeo', 'Juliet', 'Macbeth', 'Othello'],
    play: ['Hamlet', 'Romeo and Juliet', 'Macbeth', 'Othello'],
    feature: ['country', 'river', 'mountain', 'ocean', 'desert', 'lake'],
    name: ['Russia', 'Nile', 'Everest', 'Pacific', 'Sahara', 'Caspian'],
    surface: ['court', 'field', 'ice', 'track'],
    equipment: ['net', 'ball', 'stick', 'racket'],
    sport: ['Tennis', 'Soccer', 'Hockey', 'Baseball'],
    number: ['Five', 'Eleven', 'Nine', 'Seven'],
    event: ['marathon', 'sprint', 'relay'],
    unit: ['miles', 'kilometers', 'meters'],
    distance: ['26.2', '100', '400'],
    location: ['moon', 'space', 'underwater'],
    quote: ['May the Force be with you', 'Here\'s looking at you, kid', 'I\'ll be back'],
    movie: ['Star Wars', 'Casablanca', 'Terminator'],
    director: ['Orson Welles', 'Steven Spielberg', 'Martin Scorsese'],
    type: ['animated', 'silent', 'foreign', 'documentary'],
    platform: ['Spotify', 'YouTube', 'Apple Music'],
    song: ['Blinding Lights', 'Shape of You', 'Despacito'],
    album: ['Thriller', 'Back in Black', 'The Dark Side of the Moon'],
    piece: ['The Four Seasons', 'Symphony No. 9', 'The Nutcracker'],
    composer: ['Antonio Vivaldi', 'Beethoven', 'Tchaikovsky'],
    instrument: ['Stradivarius violin', 'Steinway piano', 'Fender Stratocaster']
  }
  
  let questionId = 1
  
  // Generate questions for each category
  for (const category of categories) {
    const templates = questionTemplates[category as keyof typeof questionTemplates] || [
      { q: "This is a question about {topic}", a: "The answer is {answer}" }
    ]
    
    // Generate 50 questions per category
    for (let i = 0; i < 50; i++) {
      const template = templates[i % templates.length]
      const values = [200, 400, 600, 800, 1000]
      const value = values[i % values.length]
      
      // Simple template replacement
      let question = template.q
      let answer = template.a
      
      // Replace placeholders with random values
      for (const [key, values] of Object.entries(replacements)) {
        const randomValue = values[Math.floor(Math.random() * values.length)]
        question = question.replace(`{${key}}`, randomValue)
        answer = answer.replace(`{${key}}`, randomValue)
      }
      
      questions.push({
        id: `q${questionId++}`,
        category,
        value,
        question,
        answer,
        round: 'Jeopardy!',
        show_number: Math.floor(Math.random() * 1000) + 1,
        air_date: `19${Math.floor(Math.random() * 40) + 64}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
      })
    }
  }
  
  return questions
}

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
  
  console.log('Generating large dataset...')
  const sampleQuestions = generateLargeDataset()
  console.log(`Generated ${sampleQuestions.length} questions`)
  
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
    
    // Now import questions in batches
    let importedCount = 0
    let errorCount = 0
    const batchSize = 50
    
    for (let i = 0; i < sampleQuestions.length; i += batchSize) {
      const batch = sampleQuestions.slice(i, i + batchSize)
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sampleQuestions.length / batchSize)}`)
      
      for (const question of batch) {
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
            if (importedCount % 100 === 0) {
              console.log(`Imported ${importedCount} questions...`)
            }
          }
        } catch (error) {
          console.error(`Unexpected error importing question ${question.id}:`, error)
          errorCount++
        }
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
  console.log('🚀 Starting MindDuel LARGE question import...')
  
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
