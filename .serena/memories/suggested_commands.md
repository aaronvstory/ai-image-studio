# Suggested Commands for Development

## Development Commands
```bash
# Start development server on port 3500
npm run dev

# Build for production
npm run build

# Start production server on port 3500
npm start

# Run linting
npm run lint

# Type checking
npm run typecheck

# Start Convex development (separate terminal)
npx convex dev
```

## Testing & Quality
```bash
# Run linting
npm run lint

# Type checking (via build)
npm run build

# Check bundle size
npm run build && npm run analyze
```

## Git Commands
```bash
# Stage changes
git add .

# Commit with message
git commit -m "feat: description"

# Push to remote
git push origin main
```

## Installation Commands
```bash
# Install dependencies
npm install

# Install shadcn component
npx shadcn@latest add [component-name]

# Update dependencies
npm update
```

## Port 3500 Access
- Development: http://localhost:3500
- Dashboard: http://localhost:3500/dashboard
- Serena Dashboard: http://127.0.0.1:24282/dashboard/index.html

## Windows-Specific Commands
```bash
# Kill Node processes
taskkill /F /IM node.exe

# Check port usage
netstat -ano | findstr :3500

# Clear npm cache
npm cache clean --force
```