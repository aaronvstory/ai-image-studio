import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          free_generations_used: 0,
          has_paid: false,
          subscription_status: 'inactive',
        }
      }
    })
    
    if (error) {
      console.error('Signup error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    // Auto sign in after signup
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (signInError) {
      return NextResponse.json({
        success: true,
        message: 'Account created. Please sign in.',
        user: data.user?.email
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Account created and signed in',
      user: signInData.user?.email,
      session: signInData.session ? true : false
    })
    
  } catch (error: any) {
    console.error('Signup route error:', error)
    return NextResponse.json(
      { error: error?.message || 'Server error' },
      { status: 500 }
    )
  }
}