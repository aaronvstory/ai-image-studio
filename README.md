# AI Image Studio - Professional Image Generation SaaS

A modern, production-ready SaaS application for AI-powered image generation using OpenAI's DALL-E 3 API. Built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

- **AI Image Generation**: Create stunning images from text descriptions using DALL-E 3
- **Multiple Image Sizes**: Support for 1024x1024, 1792x1024, and 1024x1792
- **Quality Options**: Choose between standard and HD quality
- **Style Selection**: Vivid or natural artistic styles
- **Authentication**: Secure user authentication with Clerk
- **Payment Integration**: Demo payment system with card validation
- **Rate Limiting**: Built-in API rate limiting for production use
- **Responsive Design**: Beautiful, mobile-first responsive UI
- **Dark Mode**: Professional dark theme by default

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.5 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Authentication**: Clerk
- **AI**: OpenAI DALL-E 3 API
- **Deployment**: Optimized for Netlify

## 📋 Prerequisites

- Node.js 20+ 
- npm or pnpm
- OpenAI API key
- Clerk account (optional, demo mode available)

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
- Add Clerk keys (or use demo mode)

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

# Clerk Authentication (optional - demo mode available)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

## 🚀 Deployment to Netlify

1. Fork/clone this repository
2. Connect your GitHub repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy!

The project includes a `netlify.toml` configuration file for optimal deployment settings.

## 📝 API Endpoints

- `POST /api/generate-image` - Generate images with DALL-E 3
- `POST /api/process-payment` - Process demo payments
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