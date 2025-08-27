# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Image Generation SaaS using OpenAI DALL-E 3 and Google Gemini. Built with Next.js 15.3.5, TypeScript 5, Tailwind CSS v4, shadcn/ui components, and Supabase authentication. Features demo payment system with Luhn validation. **Port 3500 is mandatory** for all operations.

## Critical Environment Setup

### OpenRouter Issue (MUST READ)
**Problem**: System environment variables may route OpenAI calls through OpenRouter.
**Solution**: Start dev server with clean environment:
```bash
# Windows - ALWAYS use this command
cmd /c "set OPENAI_API_KEY=&& set OPENAI_BASE_URL=&& set OPENAI_MODEL=&& set OPENROUTER_API_KEY=&& npm run dev"

# Alternative if above fails
powershell -Command "$env:OPENAI_API_KEY=$null; $env:OPENAI_BASE_URL=$null; cd 'C:\claude\gpt-new-image-gen'; npm run dev"
```

### Port Management
```bash
# Find process on port 3500
netstat -ano | findstr :3500

# Kill specific process (NOT taskkill /F /IM node.exe)
taskkill /PID <specific_pid> /F

# Or use
npx kill-port 3500
```

## Development Commands

```bash
# Development (ALWAYS on port 3500)
npm run dev              # Auto-runs cleanup, starts on :3500
npm run dev:3500         # Alternative

# Build & Production
npm run build           # Production build
npm run start           # Production server on :3500

# Code Quality
npm run lint            # ESLint
npm run typecheck       # TypeScript checking  
npm run verify          # Both lint and typecheck

# Testing
npm test                         # Jest unit tests
npm test:watch                   # Jest watch mode
npm test:coverage               # Coverage report
npm run test:playwright         # E2E tests (headless)
npm run test:playwright:headed  # E2E with browser UI
npm run test:playwright:ui      # Interactive test runner

# Workspace Management
npm run clean           # Clean temp files (runs before dev)
npm run clean:dry       # Preview cleanup
npm run workspace:health # Check workspace status
```

## Architecture & Data Flow

### Authentication Flow (Supabase)
1. **Middleware** (`middleware.ts`) protects `/dashboard/*` routes
2. **User Metadata** stored in Supabase:
   - `has_paid`: Payment status
   - `subscription_status`: 'active' | 'inactive'
   - `free_generations_used`: Usage tracking (1 free)
   - `generation_count`: Total generations

### Image Generation Pipeline
1. **Request** → API route validates auth + rate limiting
2. **Free Tier Check** → 1 generation allowed, then paywall
3. **Model Selection**:
   - DALL-E 3 → `/api/generate-image`
   - Gemini/Imagen → `/api/generate-image-gemini`
4. **Generation** → Returns image URL + metadata
5. **Usage Update** → Increments user metadata counters

### Payment System (Demo)
- **Modal Trigger**: `window.dispatchEvent(new CustomEvent("openCheckoutModal"))`
- **Validation**: Luhn algorithm (accepts 4242424242424242)
- **Update**: Sets `has_paid=true` in user metadata
- **No actual processing** - professional demo UI only

## API Endpoints

### `/api/generate-image` (DALL-E 3)
```typescript
POST {
  prompt: string,       // 3-800 chars
  size?: string,        // "1024x1024" | "1792x1024" | "1024x1792"
  quality?: string,     // "standard" | "hd"
  style?: string        // "vivid" | "natural"
}
```

### `/api/generate-image-gemini` (Gemini/Imagen)
```typescript
POST {
  prompt: string,
  model?: "gemini-2.5-flash-image" | "imagen-4",
  numberOfImages?: 1-4,
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
  quality?: "standard" | "ultra" | "fast",
  editImage?: { imageData: string, mimeType: string }
}
```

### `/api/transform-image` (GPT-4 Vision + DALL-E)
```typescript
POST {
  mode: "upload" | "generate",
  image?: string,       // base64 data URL
  prompt?: string,
  style?: string
}
```

## Key Components

### Main Generators
- `components/enhanced-image-generator.tsx` - Homepage generator with upload/text tabs
- `components/image-generator-with-gemini.tsx` - Multi-model advanced generator

### Core Libraries
- `lib/supabase/` - Server/client Supabase instances
- `lib/rate-limit.ts` - In-memory rate limiting (30 req/min)
- `lib/image-history.ts` - localStorage history management
- `lib/gemini-service.ts` - Gemini API wrapper
- `lib/payment-utils.ts` - Luhn validation

### UI Components
- `components/ui/` - shadcn/ui primitives (DO NOT MODIFY)
- Dark theme default with zinc/purple/pink palette
- Framer Motion 12 for animations
- Responsive breakpoints: sm:640px md:768px lg:1024px xl:1280px

## Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-proj-...         # OpenAI API key
GEMINI_API_KEY=AIza...             # Google Gemini API key

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Demo Mode
NEXT_PUBLIC_DEMO_MODE=false        # true bypasses auth

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
```

## Testing Endpoints

- `/test-api` - Comprehensive API testing dashboard
- `/api/test-openai` - Test OpenAI with SDK
- `/api/test-openai-simple` - Test OpenAI with fetch
- `/api/test-gemini` - Test Gemini (text analysis only)

## Common Issues & Solutions

### Next.js "@tailwind" CSS Module Error
```bash
# Clean and reinstall with legacy deps
rm -rf .next node_modules package-lock.json
npm install --legacy-peer-deps
NODE_ENV=development npm run dev
```

### OpenAI 401/405 Errors
- Check for OpenRouter environment variables
- Use clean environment startup command
- Verify API key starts with `sk-proj-`

### Image URLs Expiring
- DALL-E URLs valid ~1 hour
- Implement CDN/storage for persistence

### TypeScript Strict Mode
- Always use `@/*` imports
- Strict mode enabled - handle all nulls

## Model Capabilities

### DALL-E 3 (OpenAI)
- **Generates**: Creative artistic images
- **Sizes**: 1024x1024, 1792x1024, 1024x1792
- **Cost**: $0.04 standard, $0.08 HD

### Gemini 2.5 Flash (Google)
- **Does NOT generate images**
- **Analyzes**: Text descriptions only
- **Use case**: Prompt analysis, not generation

### Imagen 4 (Google)
- **Generates**: Photorealistic images
- **Batch**: Up to 4 images
- **Aspects**: Multiple ratios supported

## Deployment Notes

- Supports any platform (Vercel, Netlify, Railway)
- No domain restrictions with Supabase auth
- Include all environment variables
- Set `NEXT_PUBLIC_DEMO_MODE=false` for production