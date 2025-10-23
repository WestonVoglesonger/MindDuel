#!/usr/bin/env tsx

import { createGameQuestions } from './create-game-questions'

async function main() {
  console.log('🎲 Creating game questions from question pool...')

  const result = await createGameQuestions()

  if (result.success) {
    console.log('✅ Game questions selection completed!')
    console.log(`📊 Statistics:`)
    console.log(`   - Questions available: ${result.totalQuestionsInPool}`)
    console.log(`   - Questions selected: ${result.selectedQuestionsCount}`)
    console.log(`   - Sample questions:`)
    if (result.sampleQuestions) {
      result.sampleQuestions.forEach((q: any) => {
        console.log(`     • ${q.question_text.substring(0, 60)}... (${q.point_value} pts)`)
      })
    }
  } else {
    console.error('❌ Game questions selection failed:', result.error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
