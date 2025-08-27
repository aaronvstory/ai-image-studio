# AI Image Studio - Multi-Provider Image Generation SaaS

A modern, production-ready SaaS application for AI-powered image generation using multiple providers including OpenAI DALL-E 3 and Google Gemini. Built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

- **Multi-Provider Support**: Generate images with OpenAI DALL-E 3 and Google Gemini
- **Credit System**: Flexible credit-based pricing (e.g., $5 for 500 credits)
- **Multiple Image Sizes**: Support for various aspect ratios and dimensions
- **Quality Options**: Choose between standard and HD quality
- **Style Selection**: Multiple artistic styles and customization options
- **Authentication**: Secure user authentication with Supabase
- **Payment Integration**: Demo payment system with credit top-ups
- **Rate Limiting**: Built-in API rate limiting for production use
- **Responsive Design**: Beautiful, mobile-first responsive UI
- **Dark Mode**: Professional dark theme by default

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.5 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Providers**: OpenAI DALL-E 3 + Google Gemini
- **Deployment**: Optimized for Vercel

## 📋 Prerequisites

- Node.js 20+ 
- npm or pnpm
- OpenAI API key
- Google/Gemini API key
- Supabase account (for auth and database)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-image-studio.git
cd ai-image-studio
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
- Add your OpenAI API key
- Add your Google/Gemini API key
- Add Supabase URL and keys

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3500`

## 🌐 Environment Variables

Required environment variables:

```env
# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Google/Gemini API
GOOGLE_API_KEY=your_gemini_api_key
# or GEMINI_API_KEY=your_gemini_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
NEXT_PUBLIC_DEMO_MODE=false
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
```

## 🚀 Deployment to Vercel

1. Fork/clone this repository
2. Connect your GitHub repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The project is optimized for Vercel with automatic builds and deployments.

## 📝 API Endpoints

- `POST /api/gen/openai` - Generate images with OpenAI DALL-E 3
- `POST /api/gen/google` - Generate images with Google Gemini
- `POST /api/nano-banana` - Generate images with Gemini Image Preview model
- `POST /api/me` - Get user profile and credits
- `POST /api/payments/demo/confirm` - Process demo payment and add credits
- `POST /api/transform-image` - Transform existing images

## 🧪 Testing

Run the test suite:
```bash
npm test                    # Unit tests
npm run test:playwright     # E2E tests
```

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the GitHub repository.

---

Built with ❤️ using Next.js and OpenAI