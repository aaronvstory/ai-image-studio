# Elite Next.js SaaS Starter Project Overview

## Purpose
A production-ready SaaS starter template combining Next.js 15, Clerk authentication, Convex real-time database, and Clerk Billing for subscription management. Designed for rapid SaaS development with all essential features pre-configured.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5
- **Styling**: TailwindCSS v4, Radix UI, shadcn/ui components
- **Animation**: Framer Motion, Motion Primitives, React Bits, Magic UI
- **Backend**: Convex (serverless, real-time database)
- **Auth**: Clerk (authentication + billing)
- **Icons**: Lucide React, Tabler Icons
- **Charts**: Recharts

## Key Features
- Real-time data sync with Convex
- Subscription billing with Clerk Billing
- Protected routes and payment gating
- Beautiful landing page with animations
- Interactive dashboard with charts
- Dark/light theme support
- Responsive design
- TypeScript throughout

## Port Configuration
**CRITICAL**: Application runs ONLY on port 3500 (not default 3000)
- All scripts configured for port 3500
- Environment variable PORT=3500
- Documentation updated for port 3500