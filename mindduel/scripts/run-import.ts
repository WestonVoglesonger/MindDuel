#!/usr/bin/env tsx

import { importJArchiveQuestions } from './import-jarchive-questions'

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
