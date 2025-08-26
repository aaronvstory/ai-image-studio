// Demo user hook for when Clerk is not available
export function useDemoUser() {
  // Return a mock user object that mimics Clerk's useUser structure
  return {
    isLoaded: true,
    isSignedIn: false,
    user: null
  }
}