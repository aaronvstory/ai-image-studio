import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const admin = createAdminClient()
    
    const { data: packs, error } = await admin
      .from('credit_packs')
      .select('*')
      .eq('active', true)
      .order('price_cents', { ascending: true })
    
    if (error) {
      console.error('Failed to fetch credit packs:', error)
      // Return hardcoded packs as fallback
      return NextResponse.json([
        {
          id: 1,
          name: 'Starter',
          credits: 100,
          price_cents: 500,
          description: '100 credits for casual use',
          popular: false
        },
        {
          id: 2,
          name: 'Pro',
          credits: 500,
          price_cents: 2000,
          description: '500 credits - Best value!',
          popular: true
        },
        {
          id: 3,
          name: 'Business',
          credits: 2000,
          price_cents: 7500,
          description: '2000 credits for power users',
          popular: false
        }
      ])
    }
    
    return NextResponse.json(packs ?? [])
    
  } catch (error: any) {
    console.error('Credit packs API error:', error)
    // Return hardcoded packs as fallback
    return NextResponse.json([
      {
        id: 1,
        name: 'Starter',
        credits: 100,
        price_cents: 500,
        description: '100 credits for casual use',
        popular: false
      }
    ])
  }
}