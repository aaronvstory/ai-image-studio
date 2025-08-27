import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ 
        user: null, 
        credits: 0,
        authenticated: false 
      })
    }

    const admin = createAdminClient()
    
    // Get user's credit balance
    const { data: creditData } = await admin
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single()
    
    // Get user's profile
    const { data: profileData } = await admin
      .from('profiles')
      .select('credits, free_generations_used')
      .eq('id', user.id)
      .single()

    // Get recent generations count
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count: generationCount } = await admin
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())

    return NextResponse.json({ 
      user: { 
        id: user.id, 
        email: user.email 
      },
      credits: creditData?.balance ?? profileData?.credits ?? 0,
      free_generations_used: profileData?.free_generations_used ?? 0,
      generations_this_month: generationCount ?? 0,
      authenticated: true
    })
    
  } catch (error: any) {
    console.error('API /me error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch user data',
      authenticated: false 
    }, { status: 500 })
  }
}