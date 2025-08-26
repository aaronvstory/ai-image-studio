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
    
    const supabase = await createClient()
    
    // Test signup
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
    
    if (signUpError) {
      // If user exists, try to sign in
      if (signUpError.message.includes('already registered')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (signInError) {
          return NextResponse.json(
            { error: `Sign in failed: ${signInError.message}` },
            { status: 401 }
          )
        }
        
        return NextResponse.json({
          success: true,
          message: 'Signed in successfully',
          user: signInData.user?.email
        })
      }
      
      return NextResponse.json(
        { error: `Sign up failed: ${signUpError.message}` },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: signUpData.user?.email
    })
    
  } catch (error: any) {
    console.error('Test auth error:', error)
    return NextResponse.json(
      { error: error?.message || 'Server error' },
      { status: 500 }
    )
  }
}