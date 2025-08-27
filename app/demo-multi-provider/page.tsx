'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, Image, Sparkles } from 'lucide-react';
import { 
  Provider, 
  Model, 
  PROVIDER_CONFIGS, 
  MODEL_CONFIGS,
  GenerationRequest,
  GenerationResponse 
} from '@/types/image-generation';

export default function DemoMultiProvider() {
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<Provider>('openai');
  const [model, setModel] = useState<Model>('dall-e-3');
  const [prompt, setPrompt] = useState('A beautiful sunset over mountains with vibrant colors');
  const [results, setResults] = useState<{images: string[], provider: string, model: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const testGeneration = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please sign in to test image generation');
      }

      let requestBody: GenerationRequest;

      if (provider === 'openai') {
        requestBody = {
          provider: 'openai',
          mode: 'txt2img',
          prompt,
          model: model as any,
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid'
        };
      } else {
        requestBody = {
          provider: 'google',
          mode: 'txt2img', 
          prompt,
          model: model as any,
          aspectRatio: '1:1',
          numberOfImages: 2,
          quality: 'standard'
        };
      }

      const response = await fetch(`/api/gen/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json() as GenerationResponse;

      if (!response.ok || !data.success) {
        throw new Error((data as any).error || 'Generation failed');
      }

      if (data.success) {
        setResults({
          images: data.images || [data.image],
          provider: data.provider,
          model: data.model
        });
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            🎨 Multi-Provider Image Generation Demo
          </CardTitle>
          <CardDescription>
            Test both OpenAI DALL-E and Google Gemini image generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>AI Provider</Label>
                <Select value={provider} onValueChange={(value) => {
                  setProvider(value as Provider);
                  setModel(PROVIDER_CONFIGS[value as Provider].models[0] as Model);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROVIDER_CONFIGS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label} - {config.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={model} onValueChange={(value) => setModel(value as Model)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_CONFIGS[provider].models.map((modelKey) => (
                      <SelectItem key={modelKey} value={modelKey}>
                        {MODEL_CONFIGS[modelKey].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Prompt</Label>
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                />
              </div>
              
              <Button 
                onClick={testGeneration} 
                disabled={loading || !prompt.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating with {PROVIDER_CONFIGS[provider].label}...
                  </>
                ) : (
                  <>
                    <Image className="mr-2 h-4 w-4" />
                    Generate with {PROVIDER_CONFIGS[provider].label}
                  </>
                )}
              </Button>
            </div>
            
            {/* Model Info */}
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Selected Model Info</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Provider:</strong> {PROVIDER_CONFIGS[provider].label}</div>
                  <div><strong>Model:</strong> {MODEL_CONFIGS[model].label}</div>
                  <div><strong>Description:</strong> {MODEL_CONFIGS[model].description}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {MODEL_CONFIGS[model].features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <div><strong>Max Images:</strong> {MODEL_CONFIGS[model].maxImages}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <Alert className="border-red-600">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Results Display */}
          {results && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generated Images</h3>
                <Badge className={`bg-gradient-to-r ${PROVIDER_CONFIGS[results.provider as Provider].color} text-white`}>
                  {results.provider} • {results.model}
                </Badge>
              </div>
              
              <div className={`grid gap-4 ${
                results.images.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' :
                results.images.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}>
                {results.images.map((imageUrl, index) => (
                  <div key={index} className="relative rounded-xl overflow-hidden border">
                    <img
                      src={imageUrl}
                      alt={`Generated ${index + 1}`}
                      className="w-full h-64 object-cover"
                    />
                    {results.images.length > 1 && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-black/50 text-white backdrop-blur-sm">
                          {index + 1}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Instructions */}
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>How to test:</strong>
              <br />1. Select an AI provider (OpenAI or Google)
              <br />2. Choose a model from the dropdown
              <br />3. Enter a descriptive prompt
              <br />4. Click generate to test the implementation
              <br />5. Google provider will generate multiple placeholder images to demo the multi-image feature
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}