import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  // Check environment variables (without exposing sensitive values)
  const envCheck = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseUrlValue: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseAnonKeyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    demoMode: process.env.NEXT_PUBLIC_DEMO_MODE,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  }

  // Try to connect to Supabase
  let supabaseStatus = 'Not tested'
  let supabaseError = null
  
  try {
    const supabase = await createClient()
    
    // Try a simple query to test connection
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      supabaseStatus = 'Connection failed'
      supabaseError = error.message
    } else {
      supabaseStatus = 'Connected successfully'
    }
  } catch (error: any) {
    supabaseStatus = 'Connection error'
    supabaseError = error?.message || 'Unknown error'
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: envCheck,
    supabase: {
      status: supabaseStatus,
      error: supabaseError,
      urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
    },
    message: 'Debug endpoint for checking Supabase configuration'
  })
}