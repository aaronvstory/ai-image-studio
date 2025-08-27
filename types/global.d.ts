// Global ambient type helpers

declare global {
  interface Window {
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
