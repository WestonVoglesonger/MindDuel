import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase.types'

type TypedClient = SupabaseClient<Database>

let browserClient: TypedClient | null = null

/**
 * Returns a Supabase client that works in both server and browser environments.
 * On the server we rely on the existing server helper so authentication cookies
 * continue to flow through the Next.js request context. On the browser we lazily
 * create (and memoise) a single Supabase client instance per session.
 */
export async function getSupabaseClient(): Promise<TypedClient> {
  if (typeof window === 'undefined') {
    const { createClient } = await import('./server')
    return await createClient()
  }

  if (!browserClient) {
    const { createClient } = await import('./client')
    browserClient = createClient()
  }

  return browserClient
}
