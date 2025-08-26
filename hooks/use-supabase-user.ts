'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const updateUserMetadata = async (metadata: Record<string, any>) => {
    if (!user) return { error: 'No user' }
    
    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    })
    
    if (!error && data.user) {
      setUser(data.user)
    }
    
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    user,
    loading,
    isSignedIn: !!user,
    updateUserMetadata,
    signOut,
    metadata: user?.user_metadata || {}
  }
}