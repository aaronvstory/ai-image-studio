# Authentication Bypass Mode

This implementation provides a comprehensive authentication bypass system controlled by environment variables.

## Environment Variables

### `NEXT_PUBLIC_AUTH_REQUIRED`
- **Default**: `true` (authentication required)
- **Bypass**: `false` (no authentication required)
- **Effect**: When `false`, all API routes skip authentication and credit checks

### `NEXT_PUBLIC_DEMO_MODE` 
- **Default**: `false`
- **Demo**: `true` 
- **Effect**: Legacy demo mode, now supplemented by `NEXT_PUBLIC_AUTH_REQUIRED`

## Quick Setup

### Development Mode (No Auth)
```bash
# Set environment variable
export NEXT_PUBLIC_AUTH_REQUIRED=false

# Start development server
npm run dev

# Server will run with unlimited generations
```

### Windows PowerShell
```powershell
$env:NEXT_PUBLIC_AUTH_REQUIRED="false"
npm run dev
```

### Production Mode (With Auth)
```bash
# Default behavior - auth required
npm run build
npm run start
```

## What Changes

### ✅ API Routes Updated
- `/api/gen/openai/route.ts` - OpenAI DALL-E generation
- `/api/gen/gemini/route.ts` - Google Gemini generation  
- `/api/generate-image/route.ts` - Legacy OpenAI route
- `/api/generate-image-gemini/route.ts` - Legacy Gemini route
- `/api/transform-image/route.ts` - Image transformation
- `/api/nano-banana/route.ts` - Nano banana generation

### ✅ Frontend Components Updated
- `hooks/use-safe-user.ts` - Returns mock authenticated user
- `components/enhanced-image-generator.tsx` - Hides auth UI
- `app/layout.tsx` - Shows "Free Mode" banner
- `middleware.ts` - Bypasses all auth checks

### ✅ Authentication Behavior
**When `NEXT_PUBLIC_AUTH_REQUIRED=false`:**
- ❌ No login required
- ❌ No credit system 
- ❌ No rate limiting per user
- ❌ No payment modals
- ✅ Unlimited image generation
- ✅ All providers available
- ✅ All models accessible

**When `NEXT_PUBLIC_AUTH_REQUIRED=true` (default):**
- ✅ Supabase authentication required
- ✅ Credit system active
- ✅ Rate limiting enforced  
- ✅ Payment system active
- ✅ Free tier limitations

## Testing

### Automated Test
```bash
# Run comprehensive API tests
node test-auth-bypass.js
```

### Manual Testing

1. **Start in bypass mode:**
   ```bash
   export NEXT_PUBLIC_AUTH_REQUIRED=false
   npm run dev
   ```

2. **Open browser:** `http://localhost:3500`

3. **Verify UI changes:**
   - Green "Free Mode" banner at top
   - "Unlimited" text on generate button
   - No login prompts
   - No credit displays

4. **Test generation:**
   - Upload image transformation
   - Text-to-image generation
   - Multiple providers (OpenAI, Gemini)
   - Multiple images per request

### Test Real Generation
```bash
# Test OpenAI DALL-E (generates real images)
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai", "prompt": "Test image"}' \
  http://localhost:3500/api/test-real-generation

# Check saved images in test-results/openai/
```

## Files Modified

### Core API Routes (6 files)
1. `app/api/gen/openai/route.ts`
2. `app/api/gen/gemini/route.ts` 
3. `app/api/generate-image/route.ts`
4. `app/api/generate-image-gemini/route.ts`
5. `app/api/transform-image/route.ts`
6. `app/api/nano-banana/route.ts`

### Frontend Components (4 files)
1. `middleware.ts` - Request interception
2. `hooks/use-safe-user.ts` - User state management
3. `components/enhanced-image-generator.tsx` - Main UI
4. `app/layout.tsx` - Global layout

### New Files (2 files)
1. `app/api/test-real-generation/route.ts` - Testing endpoint
2. `test-auth-bypass.js` - Automated test script

## Security Notes

⚠️ **Important**: This bypass mode is designed for development and testing.

### Development Use Cases
- ✅ Local development without Supabase setup
- ✅ API testing and debugging
- ✅ Demo environments
- ✅ CI/CD testing pipelines

### Production Considerations  
- ❌ **DO NOT** use in production without rate limiting
- ❌ **DO NOT** expose unlimited API access publicly
- ✅ Consider API key rate limits from providers
- ✅ Monitor usage to prevent abuse

## Environment Examples

### Local Development (.env.local)
```bash
NEXT_PUBLIC_AUTH_REQUIRED=false
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIza...
```

### Production (.env.production)
```bash
NEXT_PUBLIC_AUTH_REQUIRED=true
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIza...
```

### Testing Environment (.env.test)
```bash
NEXT_PUBLIC_AUTH_REQUIRED=false
NODE_ENV=test
OPENAI_API_KEY=test-key
GEMINI_API_KEY=test-key
```

## Troubleshooting

### Server Not Starting
```bash
# Clean and restart
npm run clean
npm install
export NEXT_PUBLIC_AUTH_REQUIRED=false
npm run dev
```

### API Returns 401 Unauthorized
- Check environment variable is set
- Restart development server
- Clear browser cache

### Test Script Fails
- Ensure server is running on port 3500
- Check firewall/antivirus blocking requests
- Verify API keys are valid

### No Images Generated
- Check API key configuration
- Verify OpenAI/Gemini account has credits
- Check network connectivity
- Review console logs for errors

## Support

For issues with this authentication bypass implementation:

1. Check environment variables are set correctly
2. Restart development server after changes
3. Clear browser cache and cookies
4. Run the test script to verify API endpoints
5. Check browser console for JavaScript errors

The bypass mode provides a complete development environment without external authentication dependencies.