"use client";

import { useSupabaseUser } from './use-supabase-user';

interface SafeUserHook {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: any;
}

// Safe wrapper for useUser that works with Supabase
export function useSafeUser(): SafeUserHook {
  // Demo mode disables real auth
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  
  if (demoMode) {
    return {
      isLoaded: true,
      isSignedIn: true,
      user: {
        id: 'demo-user',
        primaryEmailAddress: {
          emailAddress: 'demo@example.com'
        },
        publicMetadata: {
          hasPaid: true,
          subscriptionStatus: 'active',
          subscriptionTier: 'pro',
          freeGenerationsUsed: 0
        }
      },
    };
  }

  // Use Supabase auth
  const { user, loading, isSignedIn, metadata } = useSupabaseUser();
  
  // Transform Supabase user to match expected format
  const transformedUser = user ? {
    id: user.id,
    primaryEmailAddress: {
      emailAddress: user.email
    },
    publicMetadata: {
      hasPaid: metadata.has_paid || false,
      subscriptionStatus: metadata.subscription_status || 'inactive',
      subscriptionTier: metadata.subscription_tier || 'free',
      freeGenerationsUsed: metadata.free_generations_used || 0,
      ...metadata
    }
  } : null;

  return {
    isLoaded: !loading,
    isSignedIn: isSignedIn,
    user: transformedUser,
  };
}
