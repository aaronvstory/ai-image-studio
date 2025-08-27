// Environment Variable Validation
// This utility checks if required environment variables are properly configured

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  // Check demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  if (isDemoMode) {
    info.push('Demo mode is enabled - authentication is bypassed');
  }

  // Check OpenAI API key
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey || openaiKey === 'your_openai_api_key_here' || openaiKey === 'placeholder-for-build') {
    warnings.push('OpenAI API key is not configured - DALL-E 3 generation will not work');
    warnings.push('Get your API key from https://platform.openai.com/api-keys');
  } else if (!openaiKey.startsWith('sk-')) {
    errors.push('OpenAI API key format is invalid (should start with sk-)');
  } else {
    info.push('OpenAI API key is configured');
  }

  // Check Gemini API key
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    warnings.push('Gemini API key is not configured');
  } else if (!geminiKey.startsWith('AIza')) {
    errors.push('Gemini API key format is invalid (should start with AIza)');
  } else {
    info.push('Gemini API key is configured');
    warnings.push('Note: Gemini API does not generate images, only analyzes them');
  }

  // Check authentication configuration
  if (!isDemoMode) {
    // Check Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      if (!supabaseUrl.includes('supabase.co')) {
        errors.push('Supabase URL format is invalid');
      }
      if (!supabaseKey.startsWith('eyJ')) {
        errors.push('Supabase anon key format is invalid');
      }
      info.push('Supabase authentication is configured');
    } else {
      errors.push('Authentication is not configured - Supabase credentials are missing');
      errors.push('Either enable demo mode or configure Supabase');
    }
  }

  // Check for mixed auth systems
  const hasClerkConfig = !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
    process.env.CLERK_SECRET_KEY
  );
  const hasSupabaseConfig = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (hasClerkConfig && hasSupabaseConfig) {
    warnings.push('Both Clerk and Supabase are configured - choose one authentication system');
  }

  // Port configuration
  const port = process.env.PORT;
  if (port !== '3500') {
    warnings.push(`Port is set to ${port || 'default'} instead of required 3500`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info
  };
}

// Helper function to log validation results
export function logValidationResults(result: EnvValidationResult): void {
  console.log('\n🔍 Environment Validation Results:\n');
  
  if (result.errors.length > 0) {
    console.error('❌ ERRORS:');
    result.errors.forEach(error => console.error(`   - ${error}`));
    console.log('');
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️  WARNINGS:');
    result.warnings.forEach(warning => console.warn(`   - ${warning}`));
    console.log('');
  }
  
  if (result.info.length > 0) {
    console.log('ℹ️  INFO:');
    result.info.forEach(info => console.log(`   - ${info}`));
    console.log('');
  }
  
  if (result.valid) {
    console.log('✅ Environment configuration is valid (may have warnings)');
  } else {
    console.error('❌ Environment configuration has errors that must be fixed');
  }
  console.log('');
}

// Export a function to run validation on startup
export function runEnvironmentValidation(): void {
  if (process.env.NODE_ENV === 'development') {
    const result = validateEnvironment();
    logValidationResults(result);
  }
}