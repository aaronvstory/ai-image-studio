import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }
    
    // Create Supabase client server-side (this works!)
    const supabase = await createClient()
    
    // Sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Login error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    // Ensure profile exists (for users created before profile system)
    if (data.user) {
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
        
        console.log('Profile and credits created for existing user:', data.user.id)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: data.user?.email,
      session: data.session ? true : false
    })
    
  } catch (error: any) {
    console.error('Login route error:', error)
    return NextResponse.json(
      { error: error?.message || 'Server error' },
      { status: 500 }
    )
  }
}