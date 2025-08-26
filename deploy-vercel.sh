#!/bin/bash

echo "🚀 Deploying AI Gen Studio to Vercel..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📦 Building project first..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before deploying."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "🌐 Starting Vercel deployment..."
echo ""
echo "When prompted:"
echo "1. Set up and deploy? → Yes"
echo "2. Which scope? → Your account"
echo "3. Link to existing project? → No"
echo "4. Project name? → ai-gen-studio"
echo "5. Directory? → ./"
echo "6. Override settings? → No"
echo ""
echo "After deployment, set environment variables in Vercel Dashboard:"
echo "- NEXT_PUBLIC_DEMO_MODE = true"
echo "- OPENAI_API_KEY = your-key"
echo ""

# Run vercel deployment
vercel --prod

echo ""
echo "📝 Next Steps:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Click on your project"
echo "3. Go to Settings → Environment Variables"
echo "4. Add NEXT_PUBLIC_DEMO_MODE = true"
echo "5. Add OPENAI_API_KEY = your-openai-key"
echo "6. Redeploy from Deployments tab"
echo ""
echo "✨ Your app will be live at the URL shown above!"