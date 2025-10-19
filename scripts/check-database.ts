import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

async function checkDatabase() {
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

  console.log('🔍 Checking database contents...')

  try {
    // Check categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError)
    } else {
      console.log(`📂 Categories (${categories.length}):`)
      categories.forEach(cat => {
        console.log(`   - ${cat.name}: ${cat.description}`)
      })
    }

    // Check questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        correct_answer,
        point_value,
        difficulty,
        categories!inner(name)
      `)
      .limit(50)

    if (questionsError) {
      console.error('❌ Error fetching questions:', questionsError)
    } else {
      console.log(`❓ Questions (${questions.length}):`)
      questions.forEach(q => {
        console.log(`   - [${q.point_value}] ${q.question_text.substring(0, 60)}... (${q.categories.name})`)
      })
    }

    // Check total counts
    const { count: totalQuestions } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })

    const { count: totalCategories } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })

    console.log(`\n📊 Database Summary:`)
    console.log(`   Total Categories: ${totalCategories || 0}`)
    console.log(`   Total Questions: ${totalQuestions || 0}`)

  } catch (error) {
    console.error('💥 Database check failed:', error)
  }
}

// Run the check if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabase().catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
}
