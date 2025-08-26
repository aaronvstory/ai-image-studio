import { NextResponse } from 'next/server'

export async function GET() {
  // Check what environment variables are actually available
  const envCheck = {
    // Check if they exist (not the values)
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasDemoMode: !!process.env.NEXT_PUBLIC_DEMO_MODE,
    
    // Get the actual values (be careful with this in production!)
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 50) + '...' : 
      'NOT SET',
    demoMode: process.env.NEXT_PUBLIC_DEMO_MODE || 'NOT SET',
    
    // Check the key characteristics
    keyDetails: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? {
      length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length,
      startsWithCorrect: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith('eyJ'),
      // Decode the JWT to check the iat (issued at) claim
      payload: (() => {
        try {
          const parts = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.split('.');
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          return {
            iss: payload.iss,
            ref: payload.ref,
            role: payload.role,
            iat: payload.iat,
            iatDate: new Date(payload.iat * 1000).toISOString(),
            exp: payload.exp,
            expDate: new Date(payload.exp * 1000).toISOString()
          };
        } catch (e) {
          return 'Failed to decode JWT';
        }
      })()
    } : null,
    
    // Node environment
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  };

  return NextResponse.json(envCheck);
}