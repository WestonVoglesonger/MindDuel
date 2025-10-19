import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase.types'

// Singleton pattern to prevent multiple client instances
let clientInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null

export const createClient = () => {
  if (!clientInstance) {
    clientInstance = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return clientInstance
}
