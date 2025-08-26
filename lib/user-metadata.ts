import { clerkClient } from '@clerk/nextjs/server'

export interface UserMetadata {
  hasPaid?: boolean
  subscriptionStatus?: 'active' | 'inactive'
  subscriptionTier?: 'pro' | 'basic'
  paymentDate?: string
  freeGenerationsUsed?: number
}

/**
 * Updates user public metadata in Clerk
 */
export async function updateUserMetadata(userId: string, metadata: Partial<UserMetadata>) {
  try {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    
    const updatedMetadata = {
      ...user.publicMetadata,
      ...metadata
    }
    
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: updatedMetadata
    })
    
    return { success: true, metadata: updatedMetadata }
  } catch (error) {
    console.error('Error updating user metadata:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Gets user public metadata from Clerk
 */
export async function getUserMetadata(userId: string): Promise<UserMetadata> {
  try {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    return user.publicMetadata as UserMetadata
  } catch (error) {
    console.error('Error getting user metadata:', error)
    return {}
  }
}

/**
 * Increments the free generations used counter
 */
export async function incrementFreeGenerations(userId: string) {
  const metadata = await getUserMetadata(userId)
  const currentCount = metadata.freeGenerationsUsed || 0
  
  return updateUserMetadata(userId, {
    freeGenerationsUsed: currentCount + 1
  })
}

/**
 * Marks user as paid and resets free generation counter
 */
export async function markUserAsPaid(userId: string, tier: 'pro' | 'basic' = 'pro') {
  return updateUserMetadata(userId, {
    hasPaid: true,
    subscriptionStatus: 'active',
    subscriptionTier: tier,
    paymentDate: new Date().toISOString(),
    freeGenerationsUsed: 0 // Reset counter after payment
  })
}