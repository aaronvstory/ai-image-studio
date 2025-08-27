import { createClient } from '@supabase/supabase-js'

export interface UserMetadata {
  hasPaid?: boolean
  subscriptionStatus?: 'active' | 'inactive'
  subscriptionTier?: 'pro' | 'basic'
  paymentDate?: string
  freeGenerationsUsed?: number
  has_paid?: boolean
  subscription_status?: 'active' | 'inactive'
  subscription_tier?: 'pro' | 'basic'
  payment_date?: string
  free_generations_used?: number
}

/**
 * Creates a Supabase client for server-side operations
 */
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

/**
 * Updates user metadata in Supabase
 */
export async function updateUserMetadata(userId: string, metadata: Partial<UserMetadata>) {
  try {
    const supabase = getSupabaseClient()
    
    // Get current user
    const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(userId)
    
    if (getUserError || !user) {
      console.error('Error getting user:', getUserError)
      return { success: false, error: 'User not found' }
    }
    
    // Update user metadata
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        user_metadata: {
          ...user.user_metadata,
          ...metadata
        }
      }
    )
    
    if (error) {
      console.error('Error updating user metadata:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, metadata: data.user?.user_metadata }
  } catch (error) {
    console.error('Error updating user metadata:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Gets user metadata from Supabase
 */
export async function getUserMetadata(userId: string): Promise<UserMetadata> {
  try {
    const supabase = getSupabaseClient()
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId)
    
    if (error || !user) {
      console.error('Error getting user metadata:', error)
      return {}
    }
    
    return user.user_metadata as UserMetadata
  } catch (error) {
    console.error('Error getting user metadata:', error)
    return {}
  }
}

/**
 * Increments the free generations used counter
 */
export async function incrementFreeGenerations(userId: string) {
  try {
    const currentMetadata = await getUserMetadata(userId)
    const currentCount = currentMetadata.free_generations_used || currentMetadata.freeGenerationsUsed || 0
    
    return await updateUserMetadata(userId, {
      free_generations_used: currentCount + 1,
      freeGenerationsUsed: currentCount + 1
    })
  } catch (error) {
    console.error('Error incrementing free generations:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Checks if user has access to generate images
 */
export async function checkUserAccess(userId: string): Promise<{ hasAccess: boolean; remainingFree: number }> {
  const metadata = await getUserMetadata(userId)
  const hasPaid = metadata.has_paid || metadata.hasPaid || false
  const freeUsed = metadata.free_generations_used || metadata.freeGenerationsUsed || 0
  
  return {
    hasAccess: hasPaid || freeUsed < 1,
    remainingFree: Math.max(0, 1 - freeUsed)
  }
}