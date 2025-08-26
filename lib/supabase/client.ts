import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // In demo mode or when Supabase is not configured, return a mock client
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Use placeholder values during build time or demo mode
  const url = supabaseUrl || 'https://placeholder.supabase.co'
  const key = supabaseKey || 'placeholder-anon-key'
  
  return createBrowserClient(url, key)
}