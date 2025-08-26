# 🚀 Deploy to Vercel - Quick Start Guide

## Why Vercel?
- ✅ **FREE** with generous limits (100GB bandwidth/month)
- ✅ **Clerk Support**: .vercel.app domains work with Clerk production
- ✅ **Auto-deployment** from GitHub
- ✅ **Zero configuration** for Next.js apps
- ✅ **Built-in analytics** and performance monitoring

## 📋 Step-by-Step Deployment

### Step 1: Create Vercel Account (2 minutes)
1. Go to [https://vercel.com/signup](https://vercel.com/signup)
2. Sign up with GitHub (recommended) or email
3. Verify your email if needed

### Step 2: Install Vercel CLI (1 minute)
```bash
npm install -g vercel
```

### Step 3: Deploy Your App (3 minutes)

Run this single command:
```bash
vercel
```

You'll be asked:
1. **Set up and deploy?** → Yes
2. **Which scope?** → Select your account
3. **Link to existing project?** → No (create new)
4. **Project name?** → `ai-gen-studio` (or press enter for default)
5. **In which directory?** → `./` (current directory)
6. **Override settings?** → No

🎉 **Your app will deploy and give you a URL like:** `https://ai-gen-studio-xxx.vercel.app`

### Step 4: Set Environment Variables (5 minutes)

#### Option A: Via Vercel Dashboard (Recommended)
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_DEMO_MODE` | `true` | Production |
| `OPENAI_API_KEY` | Your OpenAI API key | Production |

5. Click **Save** for each variable
6. **Redeploy** by going to **Deployments** tab → **⋮** menu → **Redeploy**

#### Option B: Via CLI
```bash
vercel env add NEXT_PUBLIC_DEMO_MODE production
# Enter: true

vercel env add OPENAI_API_KEY production
# Enter: your OpenAI API key

# Redeploy with new env vars
vercel --prod
```

### Step 5: Test Your App (1 minute)
Visit your Vercel URL and test:
1. ✅ Homepage loads
2. ✅ Click "Generate"
3. ✅ Demo authentication works
4. ✅ Image generation works
5. ✅ Payment flow works (use test card: 4242424242424242)

## 🔧 Connect to GitHub for Auto-Deployment

### Via Vercel Dashboard:
1. Go to your project in Vercel Dashboard
2. Go to **Settings** → **Git**
3. Click **Connect Git Repository**
4. Authorize Vercel to access your GitHub
5. Select your repository
6. Every push to `main` will auto-deploy!

## 🎯 Setting Up Clerk (After Vercel Deployment)

Once your app is deployed and you have your Vercel URL:

### 1. Create Clerk Production Instance
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click **Create application**
3. Choose **Production**
4. For domain, enter: `ai-gen-studio-xxx.vercel.app` (your actual Vercel URL, WITHOUT https://)
5. Get your production keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_live_`)
   - `CLERK_SECRET_KEY` (starts with `sk_live_`)

### 2. Update Vercel Environment Variables
1. In Vercel Dashboard → Settings → Environment Variables
2. Add Clerk keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. Change `NEXT_PUBLIC_DEMO_MODE` to `false`
4. Redeploy

## 📊 Vercel Free Tier Limits
- **100 GB** bandwidth per month
- **Unlimited** deployments
- **Unlimited** websites
- **10 seconds** serverless function timeout
- **SSL certificates** included
- **Auto HTTPS** enabled
- **Global CDN** included

## 🚨 Troubleshooting

### "Command not found: vercel"
```bash
# Install globally
npm install -g vercel

# Or use npx
npx vercel
```

### Build Errors
```bash
# Test build locally first
npm run build

# Fix any TypeScript errors
npm run typecheck
```

### Environment Variables Not Working
- Always redeploy after adding/changing env vars
- Check the "Environment" dropdown in Vercel dashboard
- Make sure to select "Production" for production variables

### Demo Mode
If Clerk isn't ready yet, keep `NEXT_PUBLIC_DEMO_MODE=true` to use the app immediately

## 🎉 Success Checklist
- [ ] Vercel account created
- [ ] App deployed to Vercel
- [ ] Got your `.vercel.app` URL
- [ ] Environment variables set
- [ ] Demo mode working
- [ ] GitHub connected (optional)
- [ ] Clerk configured (when ready)

## 💡 Pro Tips
1. **Use Demo Mode First**: Deploy with `NEXT_PUBLIC_DEMO_MODE=true` to test immediately
2. **GitHub Integration**: Connect GitHub for automatic deployments
3. **Custom Domain**: Add your own domain later in Vercel Dashboard → Domains
4. **Analytics**: Check Vercel Analytics tab for free insights
5. **Logs**: Use Vercel Functions tab to debug API issues

## 🔗 Quick Links
- Your Dashboard: [https://vercel.com/dashboard](https://vercel.com/dashboard)
- Vercel Docs: [https://vercel.com/docs](https://vercel.com/docs)
- Clerk Dashboard: [https://dashboard.clerk.com](https://dashboard.clerk.com)

---

**Need Help?** The app works perfectly in demo mode while you set up Clerk!
Just deploy with `NEXT_PUBLIC_DEMO_MODE=true` and you're good to go! 🚀