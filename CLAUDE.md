# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered image generation SaaS using OpenAI's DALL-E 3. Built with Next.js 15.3.5, Clerk authentication, TypeScript 5, and shadcn/ui v4. Features payment gating with demo checkout and runs exclusively on port 3500.

### 🚀 Current Implementation Status
- ⚠️ **Clerk Authentication**: Configured with provided keys (pk_test_bWVldC1jb3lvdGUtMi5jbGVyay5hY2NvdW50cy5kZXYk)
- ✅ **Clerk App Router Setup**: Using clerkMiddleware() in middleware.ts
- ✅ **ClerkProvider**: Properly wrapping app in layout.tsx
- ✅ **Authentication Pages**: SignIn/SignUp components at `/sign-in` and `/sign-up`
- ✅ **Environment Variables**: All Clerk env vars configured including FAPI
- ⚠️ **Current Issue**: Clerk fails to initialize (see docs/clerk-integration-report.md)
- 📚 **Full Documentation**: [`docs/clerk-integration-report.md`](./docs/clerk-integration-report.md)

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

### Authentication & Authorization
- **Clerk middleware** protects `/dashboard/*` routes (configured in `middleware.ts`)
- **Public routes**: `/`, `/sign-in`, `/sign-up`, `/checkout`, `/api/process-payment`
- **User metadata structure**:
```typescript
publicMetadata: {
  hasPaid: boolean,
  subscriptionStatus: 'active' | 'inactive',
  subscriptionTier: 'pro' | 'basic',
  paymentDate: string,
  freeGenerationsUsed?: number
}
```

### API Endpoints
- **`/api/generate-image`**: DALL-E 3 generation (requires auth + payment)
  - Input validation with Zod schema (3-800 char prompt)
  - Rate limiting: 30 req/min (configurable)
  - Returns: Image URL + revised prompt
- **`/api/process-payment`**: Demo payment processing
  - Validates with Luhn algorithm
  - Updates Clerk user metadata
- **`/api/transform-image`**: Image transformations

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

## Environment Variables (.env.local)

```bash
# REQUIRED
PORT=3500
OPENAI_API_KEY=sk-...

# Clerk Authentication (Current Configuration)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bWVldC1jb3lvdGUtMi5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_ETWcdJ5ZpK5y2AK0aBBfiHWKhEdQonKNhA4bn53K6y
NEXT_PUBLIC_CLERK_FAPI=https://meet-coyote-2.clerk.accounts.dev

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Clerk Redirects
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Demo Mode (set to true if Clerk keys don't work)
NEXT_PUBLIC_DEMO_MODE=false

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
- **Fully functional Clerk authentication with hosted pages**
- **Free generation system working**
- **Payment gating operational**
- **Complete documentation**: See [`docs/authentication-implementation.md`](./docs/authentication-implementation.md)

### User Journey
1. **New users**: Redirected to `/sign-up` when attempting generation
2. **Free tier**: 1 free generation tracked in `freeGenerationsUsed` 
3. **Paywall**: Checkout modal opens after free generation exhausted
4. **Demo cards**: Any Luhn-valid number (4242424242424242, 5555555555554444)
5. **Post-payment**: Unlimited generations with pro tier

### Key Files
- **User Metadata Utilities**: `lib/user-metadata.ts`
- **Enhanced Generator**: `components/enhanced-image-generator.tsx` 
- **Auth Pages**: `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`
- **API Routes**: `app/api/generate-image/route.ts`, `app/api/process-payment/route.ts`
- **Tests**: `tests/seamless-auth-flow.spec.ts`

### Demo Login Credentials (ALWAYS USE FOR TESTING)
- **Email**: rookies-horror1r@icloud.com
- **Username**: demo
- **Phone**: (323) 323-3232  
- **Password**: demo123
- **Sign In URL**: https://meet-coyote-2.accounts.dev/sign-in
- **Sign Up URL**: https://meet-coyote-2.accounts.dev/sign-up
- **Testing Tool**: Always use Puppeteer MCP for authentication testing

### Clerk Configuration Details
- **Dark Mode**: Default enabled
- **Primary Color**: #6C47FF
- **Light Background**: #FFFFFF
- **Dark Background**: #1F1F23
- **Appearance**: Respects user system settings with dark as default

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

**Payment not updating**: Verify Clerk secret key and metadata update

**Image URLs expire**: DALL-E URLs valid ~1 hour only

**TypeScript errors**: Use `@/*` imports, strict mode enabled

## Recent Updates (2025-08-26)

### Authentication Implementation
- Migrated from custom auth modal to Clerk hosted pages
- Implemented user metadata utilities for state management
- Added comprehensive test suite for authentication flow
- Created detailed documentation in `docs/` folder
- Fixed useUser hook import and integration

### Key Files Modified
- `components/enhanced-image-generator.tsx` - Enabled Clerk hooks
- `lib/user-metadata.ts` - Created for metadata management
- `app/api/generate-image/route.ts` - Updated with metadata tracking
- `app/api/process-payment/route.ts` - Integrated payment status updates
- `tests/seamless-auth-flow.spec.ts` - Complete E2E test coverage

## Production Checklist

- [ ] Remove 49 console.log statements
- [ ] Set NEXT_PUBLIC_DEMO_MODE=false
- [ ] Upgrade rate limiting to Redis
- [ ] Replace demo payment with Stripe/Paddle
- [ ] Configure error tracking (Sentry)
- [ ] Set up CDN for images
- [ ] Add database for history/analytics
- [x] Implement Clerk authentication (COMPLETED)
- [x] Add free generation system (COMPLETED)
- [x] Create payment gating (COMPLETED)

## Key Patterns

- **Authentication**: Check via Clerk middleware + user metadata
- **Payment gating**: Verify `hasPaid` and `subscriptionStatus` 
- **Error handling**: Toast notifications with sonner
- **Loading states**: Loader2 spinner throughout
- **Dark theme default**: zinc/purple/pink color scheme
- **Responsive breakpoints**: sm:640px md:768px lg:1024px xl:1280px