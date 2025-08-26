import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // These are replaced at build time by Next.js
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration missing')
    // Return a placeholder client to prevent app crash
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key'
    )
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey)
}