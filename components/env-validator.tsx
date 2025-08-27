'use client'

import { useEffect } from 'react';
import { runEnvironmentValidation } from '@/lib/env-validation';

export function EnvValidator() {
  useEffect(() => {
    // Run validation only in development and on client side
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      runEnvironmentValidation();
    }
  }, []);

  return null; // This component doesn't render anything
}