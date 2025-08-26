// Global ambient type helpers
// Extends Window with optional Clerk to satisfy tests referencing window.Clerk
// Minimal shape only
interface ClerkGlobal {
  openSignIn?: () => void;
  openSignUp?: () => void;
}

declare global {
  interface Window {
    Clerk?: ClerkGlobal;
    confetti?: (options?: {
      particleCount?: number;
      spread?: number;
      origin?: { x?: number; y?: number };
      colors?: string[];
      duration?: number;
      scalar?: number;
      zIndex?: number;
      disableForReducedMotion?: boolean;
    }) => void;
  }
}

export {};
