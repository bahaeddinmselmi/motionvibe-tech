import { createClient } from '@supabase/supabase-js'

// Service client — no cookies dependency, safe in API routes
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
