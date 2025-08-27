import { MultiProviderGenerator } from "@/components/multi-provider-generator";
import { HeroHeader } from "./(landing)/header";
import FooterSection from "./(landing)/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950/20 to-zinc-950">
      <HeroHeader />
      <main className="container mx-auto px-4 pt-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            AI Image Studio - Multi-Provider Generation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your ideas into stunning visuals with OpenAI DALL-E 3 and Google Gemini. 
            Create, edit, and perfect images with our flexible credit system.
          </p>
        </div>
        <MultiProviderGenerator />
      </main>
      <FooterSection />
    </div>
  );
}