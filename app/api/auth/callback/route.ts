import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Create profile if it doesn't exist
      const admin = createAdminClient()
      
      // Check if profile exists
      const { data: existingProfile } = await admin
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()
      
      if (!existingProfile) {
        // Create profile
        await admin.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          credits: 5,
          free_generations_used: 0
        })
        
        // Create credits record
        await admin.from('credits').insert({
          user_id: data.user.id,
          balance: 5
        })
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/`)
}