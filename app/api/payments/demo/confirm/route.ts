import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { credits, pack_id } = body as { credits: number; pack_id?: number }
    
    if (!credits || credits <= 0) {
      return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 })
    }

    const admin = createAdminClient()
    
    // Add credits to user's balance
    await admin.rpc('add_credits', { 
      p_user_id: user.id, 
      p_delta: credits 
    })
    
    // Calculate amount in cents based on our pricing
    // $5 = 500 credits, so 1 credit = 1 cent
    const amountCents = credits // Simple 1:1 mapping for demo
    
    // Log the demo payment
    await admin.from('demo_payments').insert({ 
      user_id: user.id, 
      credits_added: credits,
      amount_cents: amountCents
    })
    
    // Get updated balance
    const { data: creditData } = await admin
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ 
      success: true,
      credits_added: credits,
      new_balance: creditData?.balance ?? 0,
      message: `Successfully added ${credits} credits to your account!`
    })
    
  } catch (error: any) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json({ 
      error: 'Failed to process payment' 
    }, { status: 500 })
  }
}