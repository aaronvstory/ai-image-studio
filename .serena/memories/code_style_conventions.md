# Code Style and Conventions

## TypeScript Conventions
- Strict mode enabled (`"strict": true`)
- Use type imports: `import type { NextConfig } from "next"`
- Path alias: `@/*` maps to root directory
- Target ES2017 for compatibility
- Prefer interfaces over types for object shapes

## File Naming
- Components: kebab-case (e.g., `hero-section.tsx`)
- Utilities: kebab-case (e.g., `use-mobile.ts`)
- Convex functions: camelCase (e.g., `paymentAttempts.ts`)
- Constants: UPPER_SNAKE_CASE

## Component Structure
- Functional components with TypeScript
- Server components by default
- Use `"use client"` directive only when needed
- Props interfaces named as `{ComponentName}Props`
- Export components as default when appropriate

## Directory Organization
```
app/              # Pages and routes
components/ui/    # Reusable shadcn components
components/       # App-specific components
convex/          # Backend functions
hooks/           # Custom React hooks
lib/             # Utility functions
public/          # Static assets
```

## Styling Approach
- TailwindCSS utilities preferred
- CSS modules for complex styles
- Dark mode variables in globals.css
- Consistent spacing using Tailwind classes
- Responsive design with Tailwind breakpoints

## Import Order
1. React/Next imports
2. Third-party libraries
3. Internal components
4. Internal utilities
5. Types
6. Styles

## Best Practices
- Always handle loading and error states
- Use Suspense boundaries for async components
- Implement proper TypeScript types
- Add ARIA labels for accessibility
- Test on port 3500 exclusively