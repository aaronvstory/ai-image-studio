# Port 3500 Configuration Guide

## ⚠️ CRITICAL: This Application Runs ONLY on Port 3500

This application is configured to run exclusively on port 3500. All development, testing, and production deployments must use this port.

## Configuration Locations

### 1. Package.json Scripts
```json
"scripts": {
  "dev": "next dev --turbopack --port 3500",
  "start": "next start --port 3500"
}
```

### 2. Environment Variables (.env.example)
```env
PORT=3500
```

### 3. Next.js Configuration (next.config.ts)
```typescript
env: {
  PORT: '3500',
}
```

## Running the Application

### Development Mode
```bash
npm run dev
# Application starts at http://localhost:3500
```

### Production Mode
```bash
npm run build
npm start
# Application starts at http://localhost:3500
```

## Deployment Configuration

### Vercel
Add environment variable in project settings:
```
PORT=3500
```

### Docker
```dockerfile
EXPOSE 3500
CMD ["npm", "start", "--", "--port", "3500"]
```

### PM2
```bash
pm2 start npm --name "app" -- start -- --port 3500
```

### systemd Service
```ini
[Service]
Environment="PORT=3500"
ExecStart=/usr/bin/npm start -- --port 3500
```

## Troubleshooting

### Port Already in Use
If you get an error that port 3500 is already in use:

**Windows:**
```bash
# Find process using port 3500
netstat -ano | findstr :3500

# Kill process (replace PID with actual process ID)
taskkill /PID [PID] /F
```

**Linux/Mac:**
```bash
# Find process using port 3500
lsof -i :3500

# Kill process
kill -9 [PID]
```

### Verify Port Configuration
To verify the application is running on the correct port:
1. Start the application: `npm run dev`
2. Check the console output for: `Local: http://localhost:3500`
3. Open browser at http://localhost:3500

## Why Port 3500?

This application uses port 3500 to:
- Avoid conflicts with other Next.js apps (default 3000)
- Provide consistent development environment
- Match production deployment requirements
- Ensure all team members use the same configuration

## Important Notes

- **Never change the port configuration**
- All documentation references port 3500
- Webhooks and external services expect port 3500
- Testing must be done on port 3500
- CI/CD pipelines are configured for port 3500

## Quick Reference

| Environment | Command | URL |
|------------|---------|-----|
| Development | `npm run dev` | http://localhost:3500 |
| Production | `npm start` | http://localhost:3500 |
| Dashboard | - | http://localhost:3500/dashboard |
| Serena | - | http://127.0.0.1:24282/dashboard |

---

**Remember: ALWAYS use port 3500. This is not configurable.**