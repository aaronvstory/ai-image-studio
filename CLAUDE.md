# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered image generation SaaS using OpenAI's DALL-E 3 and Google Gemini (text analysis only). Built with Next.js 15.3.5, **Supabase authentication**, TypeScript 5, and shadcn/ui v4. Features a **custom demo payment system** with Luhn card validation. Runs exclusively on port 3500.

## 🚨 IMPORTANT: Authentication & Payment Architecture

**THIS APPLICATION USES:**
- **Supabase ONLY** for authentication and database
- **Custom demo payment system** with Luhn validation (NO Stripe, NO Clerk, NO third-party payment processors)
- **No Clerk anywhere** - Fully removed from codebase
- Payment is a professional-looking demo placeholder for now

## 🚀 Deployment Platform: Any Platform Supported

**Flexible Deployment**: This app can be deployed to any platform (Vercel, Netlify, Railway, etc.) since we use Supabase authentication which works on any domain without restrictions.

### Deployment Status
- **Platform**: Any (Vercel, Netlify, Railway, etc.)
- **URL Format**: Works with any domain (.vercel.app, .netlify.app, custom domains)
- **Auto-Deploy**: Configurable with any Git provider
- **Demo Mode**: Available as fallback when Supabase not configured

### Current Implementation Status ✅
- ✅ **Supabase Authentication**: Full authentication system with session management
- ✅ **Custom Auth Pages**: `/auth/login` and `/auth/signup`
- ✅ **User Metadata**: Stores payment status, subscription info, and usage tracking in Supabase
- ✅ **Demo Payment System**: Professional-looking checkout with Luhn card validation
- ✅ **Demo Mode**: `NEXT_PUBLIC_DEMO_MODE=true` bypasses auth entirely
- ✅ **Gemini Integration**: Text analysis support (note: Gemini doesn't generate images)
- ✅ **Domain Flexibility**: Works on any domain without restrictions

## ⚠️ Known Issues & Important Notes

### Current State (2025-08-27)
1. **API Keys Required**: 
   - OpenAI API key needed for DALL-E 3 functionality
   - Gemini API key for text analysis (not image generation)
2. **Gemini Limitation**: Gemini API doesn't generate images, only analyzes them
   - Using placeholder images for demonstration
   - Consider labeling as "Image Analysis Only"
3. **Demo Payment**: Custom implementation with Luhn validation
   - Professional UI but no actual payment processing
   - Updates user metadata in Supabase

### Immediate Actions Required
1. Get valid OpenAI API key for DALL-E 3 functionality
2. Configure Supabase project with proper credentials
3. Consider redesigning Gemini integration as analysis-focused

## Critical Process Management

**DO NOT use `taskkill /F /IM node.exe`** - This kills ALL Node processes system-wide. Instead:
```bash
# Find specific PID on port 3500
netstat -ano | findstr :3500
taskkill /PID <specific_pid> /F

# Or use npm kill-port if installed
npx kill-port 3500
```

## Development Commands

```bash
# Development (port 3500 with automatic cleanup)
npm run dev           # Runs predev cleanup then starts on :3500
npm run dev:3500      # Alternative command

# Production
npm run build         # Build for production  
npm run start         # Start production server on :3500

# Deployment (to any platform)
npx vercel            # Deploy to Vercel
npx netlify deploy    # Deploy to Netlify
# Or use platform-specific deployment commands

# Code Quality
npm run lint          # ESLint
npm run typecheck     # TypeScript checking
npm run verify        # Both lint and typecheck

# Testing
npm test                       # Jest unit tests
npm test:watch                 # Jest watch mode
npm test:coverage             # Coverage report
npm run test:playwright       # E2E tests (headless)
npm run test:playwright:headed # E2E with browser UI
npm run test:playwright:ui    # Interactive test runner

# Workspace Management (runs automatically before dev)
npm run clean         # Clean temporary files
npm run clean:dry     # Preview cleanup
npm run workspace:health # Check workspace status
```

## Architecture

### Authentication & Authorization (Supabase Only)
- **Supabase middleware** protects `/dashboard/*` routes (configured in `middleware.ts`)
- **Public routes**: `/`, `/auth/login`, `/auth/signup`, `/checkout`, `/api/process-payment`
- **User metadata structure** (stored in Supabase):
```typescript
user_metadata: {
  has_paid?: boolean,
  subscription_status?: 'active' | 'inactive',
  subscription_tier?: 'pro' | 'basic',
  payment_date?: string,
  free_generations_used?: number,
  generation_count?: number
}
```

### API Endpoints
- **`/api/generate-image`**: DALL-E 3 generation (requires auth + payment)
  - Input validation with Zod schema (3-800 char prompt)
  - Rate limiting: 30 req/min (configurable)
  - Returns: Image URL + revised prompt
- **`/api/transform-image`**: Image transformations
  - Supports upload mode with GPT-4 Vision analysis
  - Generate mode for text-to-image
- **`/api/process-payment`**: Demo payment processing
  - Validates with Luhn algorithm
  - Updates Supabase user metadata
  - No actual payment processing (demo only)

### Image Generation Parameters
```typescript
{
  prompt: string,        // 3-800 characters
  size: '1024x1024' | '1792x1024' | '1024x1792',
  quality: 'standard' | 'hd',  // hd costs 2x
  style: 'vivid' | 'natural',
  model: 'dall-e-3'      // Always dall-e-3
}
```

### Component Libraries
- **shadcn/ui v4** (`components/ui/`) - Base components, DO NOT modify
- **Custom components** (`components/`) - App-specific components
- **Radix UI** - All interactive primitives
- **Framer Motion 12** - Animations
- **Lucide React** + **Tabler Icons** - Icons
- **CVA** - Component variants
- **tailwind-merge** - Use `cn()` utility

## Image Generation Models

### Supported Models
1. **DALL-E 3** (OpenAI)
   - Best for creative and artistic images
   - Sizes: 1024x1024, 1792x1024, 1024x1792
   - Quality: standard, HD
   - Style: vivid, natural
   - Actually generates images

2. **Gemini 2.5 Flash** (Google)
   - **NOTE: Does NOT generate images**
   - Text analysis and vision capabilities only
   - Currently returns placeholder images
   - Consider removing or repurposing as analysis tool

## Environment Variables (.env.local)

```bash
# REQUIRED - Port Configuration
PORT=3500

# Demo Mode - Set to true to bypass authentication
NEXT_PUBLIC_DEMO_MODE=false

# OpenAI API (For DALL-E 3 image generation)
OPENAI_API_KEY=sk-...  # Get from https://platform.openai.com/api-keys
                       # Required for DALL-E 3 image generation
                       # Costs: $0.04 per standard image, $0.08 per HD image

# Gemini API (For text analysis - does NOT generate images)
GEMINI_API_KEY=AIza...  # Get from https://makersuite.google.com/app/apikey
                        # Note: Gemini doesn't generate images, only analyzes them

# Supabase Configuration (For authentication and user data)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
```

## Testing

### Running Tests
```bash
# Jest unit tests
npm test
npm test -- lib/__tests__/payment-utils.test.ts  # Single file

# Playwright E2E (ensure dev server running on :3500)
npx playwright test tests/duck-generation-test.spec.ts
npx playwright test --debug tests/comprehensive-test.spec.ts
```

### Test Configuration
- **Playwright**: Chromium, headed mode with 500ms slowMo, screenshots/video on failure
- **Jest**: ts-jest with jsdom, coverage for app/components/lib directories

### Test Files
- `lib/__tests__/payment-utils.test.ts` - Payment validation unit tests
- `tests/*.spec.ts` - Playwright E2E tests

## Authentication Flow

### Current Implementation Status ✅
- **Fully functional Supabase authentication**
- **Custom auth pages** at `/auth/login` and `/auth/signup`
- **Free generation system** (1 free image)
- **Demo payment system** with Luhn card validation
- **User metadata** stored in Supabase

### User Journey
1. **New users**: Redirected to `/auth/signup` when attempting generation
2. **Free tier**: 1 free generation tracked in `generation_count` in Supabase user metadata
3. **Paywall**: Custom demo checkout modal opens after free generation exhausted
4. **Demo cards**: Any Luhn-valid number (4242424242424242, 5555555555554444)
5. **Post-payment**: Updates `has_paid` in user metadata, enables unlimited generations

### Key Files
- **User Metadata Utilities**: `lib/user-metadata.ts` (Supabase user metadata operations)
- **Enhanced Generator**: `components/enhanced-image-generator.tsx` 
- **Auth Pages**: `app/auth/login/page.tsx`, `app/auth/signup/page.tsx`
- **API Routes**: 
  - `app/api/generate-image/route.ts` (DALL-E 3 generation)
  - `app/api/transform-image/route.ts` (Image transformations)
  - `app/api/process-payment/route.ts` (Demo payment processing)
- **Supabase Client**: `lib/supabase/server.ts`, `lib/supabase/client.ts`

### Demo Mode Testing
- **Enable Demo Mode**: Set `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local`
- **Demo User**: Automatically signed in with demo user data
- **No Auth Required**: Bypasses all authentication checks
- **Unlimited Usage**: No payment or generation limits in demo mode
- **Testing**: Use for development and testing without Supabase setup

### Supabase Configuration
- **Auth Pages**: Custom built at `/auth/login` and `/auth/signup`
- **Session Management**: Server-side with cookies
- **User Metadata**: Stores payment and usage information
- **Password Recovery**: Available at `/auth/reset-password` (if implemented)
- **Email Verification**: Optional, configurable in Supabase dashboard

## Security Implementation

### Rate Limiting (`lib/rate-limit.ts`)
- In-memory storage (upgrade to Redis for production)
- Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

### Input Validation
- All endpoints use Zod schemas
- Prompt: 3-800 characters required
- Size/quality/style enums enforced

### Security Headers (`next.config.ts`)
- CSP, X-Frame-Options, X-Content-Type-Options, HSTS configured

## Workspace Management

The `cleanup.js` script runs automatically before `npm run dev`:
- Removes Windows reserved names (nul, con, prn, aux)
- Cleans temp files (*.tmp, *.log, debug_*)
- Protected: node_modules/, .git/, .next/static/, public/

## Common Issues

**Port conflicts**: Kill specific process on 3500, not all Node processes

**OpenAI errors**: Check API key, rate limits, content policy

**Payment not updating**: Check Supabase user metadata update in `updateUserMetadata()` function

**Image URLs expire**: DALL-E URLs valid ~1 hour only

**TypeScript errors**: Use `@/*` imports, strict mode enabled

## Recent Updates (2025-08-27)

### Complete Clerk Removal
- **Removed all Clerk dependencies** from package.json
- **Deleted Clerk components** and auth pages
- **Updated all API routes** to use Supabase authentication
- **Migrated user metadata** to Supabase user_metadata
- **Updated header** with custom AuthButtons component
- **Cleaned environment variables** - removed all Clerk configs

### Authentication Implementation
- **Supabase-only architecture** - No third-party auth providers
- **Custom auth pages** at `/auth/login` and `/auth/signup`
- **User metadata utilities** for managing payment status and usage
- **Demo payment system** with Luhn validation
- **useSafeUser hook** for consistent auth state access

## Production Checklist

- [ ] Remove console.log statements in production code
- [ ] Set NEXT_PUBLIC_DEMO_MODE=false
- [ ] Upgrade rate limiting to Redis
- [ ] Keep demo payment system (professional placeholder)
- [ ] Configure error tracking (Sentry)
- [ ] Set up CDN for images
- [ ] Add database for history/analytics
- [x] Implement Supabase authentication (COMPLETED)
- [x] Add free generation system (COMPLETED)
- [x] Create payment gating (COMPLETED)
- [x] Remove all Clerk code (COMPLETED)

## Key Patterns

- **Authentication**: Check via Supabase session + user metadata
- **Payment gating**: Verify `has_paid` and `subscription_status` 
- **Error handling**: Toast notifications with sonner
- **Loading states**: Loader2 spinner throughout
- **Dark theme default**: zinc/purple/pink color scheme
- **Responsive breakpoints**: sm:640px md:768px lg:1024px xl:1280px