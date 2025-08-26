"use client";

import type { UserResource } from "@clerk/types";

interface SafeUserHook {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: (UserResource & { publicMetadata?: Record<string, any> }) | null;
}

// Safe wrapper for useUser that works with or without Clerk
export function useSafeUser(): SafeUserHook {
  // Demo mode or missing Clerk publishable key disables real auth
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!hasClerkKey || demoMode) {
    return {
      isLoaded: true,
      isSignedIn: false,
      user: null,
    };
  }

  // Dynamically require to avoid build-time errors if Clerk not initialized
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useUser } =
      require("@clerk/nextjs") as typeof import("@clerk/nextjs");
    const { isLoaded, isSignedIn, user } = useUser();
    return {
      isLoaded: !!isLoaded,
      isSignedIn: !!isSignedIn,
      user: user ? (user as any) : null,
    };
  } catch {
    return {
      isLoaded: true,
      isSignedIn: false,
      user: null,
    };
  }
}
