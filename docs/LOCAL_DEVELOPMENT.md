# Local Development Guide

## Setup

### 1. Environment Variables
Your `.env` file is already configured for local development:
```bash
DATABASE_URL="file:./dev.db"  # SQLite database
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates dev.db)
npx prisma migrate dev

# Optional: Open Prisma Studio to view/edit data
npx prisma studio
```

### 4. Start Development Server
```bash
npm run dev
```
Visit http://localhost:3000

## Development Workflow

### Making Changes Locally
1. Make your code changes
2. Test locally at http://localhost:3000
3. Run tests: `npm test`
4. Check types: `npm run type-check`

### Database Changes
```bash
# Create a new migration
npx prisma migrate dev --name description_of_changes

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

### Deploying to Vercel
```bash
# Commit your changes
git add .
git commit -m "Description of changes"

# Push to GitHub (triggers Vercel deployment)
git push origin master
```

Vercel automatically deploys when you push to `master` branch.

## Environment Differences

| Feature | Local | Production (Vercel) |
|---------|-------|---------------------|
| Database | SQLite (dev.db) | PostgreSQL (Vercel Postgres) |
| Auth URL | http://localhost:3000 | https://thelujproject.vercel.app |
| File Storage | Local filesystem | Vercel Blob Storage |

## Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npx prisma studio              # Database GUI
npx prisma migrate dev         # Create migration
npx prisma db push             # Push schema without migration

# Testing
npm test                       # Run E2E tests
npm run test:ui                # Run tests with UI

# Quality Checks
npm run lint                   # Check code quality
npm run type-check             # Check TypeScript
```

## Troubleshooting

### Database Issues
```bash
# If migrations fail, reset:
npx prisma migrate reset

# If Prisma client is out of sync:
npx prisma generate
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```
