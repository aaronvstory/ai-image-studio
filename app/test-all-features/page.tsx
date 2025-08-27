'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function TestAllFeatures() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const supabase = createClient();

  const addResult = (test: string, success: boolean, message: string) => {
    setResults(prev => ({ ...prev, [test]: { success, message } }));
  };

  const testAuth = async () => {
    const email = `test${Date.now()}@test.com`;
    const password = 'TestPassword123!';
    
    // Sign up
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    
    // Check profile created
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user?.id)
      .single();
    
    if (!profile) throw new Error('Profile not created');
    
    return `User created with ${profile.credits} credits`;
  };

  const testCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Test consume
    const { data: consumed } = await supabase.rpc('consume_credit', {
      p_user_id: user.id,
      p_amount: 1
    });
    
    // Test refund
    const { data: refunded } = await supabase.rpc('refund_credit', {
      p_user_id: user.id,
      p_amount: 1
    });
    
    // Test add
    const { data: added } = await supabase.rpc('add_credits', {
      p_user_id: user.id,
      p_amount: 50
    });
    
    return `Credits working: Balance = ${added}`;
  };

  const testOpenAI = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const response = await fetch('/api/gen/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'A beautiful sunset over mountains',
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid'
      })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Generation failed');
    
    return `Image generated: ${data.url ? 'Success' : 'Failed'}`;
  };

  const testGemini = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const response = await fetch('/api/gen/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'google',
        mode: 'txt2img',
        prompt: 'A futuristic cityscape with flying cars and neon lights',
        model: 'imagen-3',
        aspectRatio: '1:1',
        numberOfImages: 2,
        quality: 'standard'
      })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Generation failed');
    
    return `Generated ${data.numberOfImages || 1} image(s) with ${data.model}`;
  };

  const testPayment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const response = await fetch('/api/process-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creditPackId: 2, // Pro pack
        paymentMethod: {
          cardNumber: '4242424242424242',
          expiryDate: '12/25',
          cvv: '123'
        }
      })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Payment failed');
    
    return `500 credits added, new balance: ${data.newBalance}`;
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults({});
    
    const tests = [
      { name: 'Authentication', fn: testAuth },
      { name: 'Credit System', fn: testCredits },
      { name: 'OpenAI Generation', fn: testOpenAI },
      { name: 'Gemini Generation', fn: testGemini },
      { name: 'Demo Payment', fn: testPayment }
    ];
    
    for (const test of tests) {
      try {
        const result = await test.fn();
        addResult(test.name, true, result);
      } catch (error: any) {
        addResult(test.name, false, error.message);
      }
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Comprehensive Feature Test</CardTitle>
          <CardDescription>
            Test all features: Auth, Credits, OpenAI, Gemini, and Payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runAllTests} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run All Tests'
            )}
          </Button>
          
          {Object.entries(results).map(([test, result]) => (
            <Alert key={test} className={result.success ? 'border-green-600' : 'border-red-600'}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-semibold">{test}</div>
                  <AlertDescription className="mt-1">
                    {result.message}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
          
          {Object.keys(results).length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium">
                Summary: {Object.values(results).filter(r => r.success).length}/{Object.keys(results).length} tests passed
              </div>
              {Object.values(results).every(r => r.success) && (
                <div className="text-sm text-green-600 mt-1">
                  ✅ All systems operational!
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}