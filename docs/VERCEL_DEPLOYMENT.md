# Vercel Deployment Guide - The Luj Project

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub repository already connected (✓ Done: WGhaly/event-support-bot)

## Step 1: Install Vercel CLI (Optional but Recommended)
```bash
npm i -g vercel
```

## Step 2: Create PostgreSQL Database on Vercel

### Via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Click on **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a database name (e.g., "luj-project-db")
6. Select a region close to your users
7. Click **Create**

### Get Database Connection Strings:
Once created, you'll see two important connection strings:
- **POSTGRES_URL** - Use for DATABASE_URL (with connection pooling)
- **POSTGRES_URL_NON_POOLING** - Use for DIRECT_URL (direct connection)

## Step 3: Deploy to Vercel

### Method A: Via Vercel Dashboard (Recommended for First Deploy)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `WGhaly/event-support-bot`
3. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `id-card-platform`
   - **Build Command:** `prisma generate && prisma migrate deploy && next build`
   - **Output Directory:** `.next` (default)

4. **Add Environment Variables:**
   Click on "Environment Variables" and add:
   
   ```
   DATABASE_URL=<from Vercel Postgres - POSTGRES_URL>
   DIRECT_URL=<from Vercel Postgres - POSTGRES_URL_NON_POOLING>
   AUTH_SECRET=<generate with: openssl rand -base64 32>
   AUTH_URL=https://your-project-name.vercel.app
   BLOB_READ_WRITE_TOKEN=<from Vercel Blob Storage>
   NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
   ```

5. Click **Deploy**

### Method B: Via Vercel CLI

```bash
cd id-card-platform
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set up project settings
# - Deploy
```

## Step 4: Configure Vercel Blob Storage

1. In Vercel Dashboard, go to **Storage** tab
2. Click **Create Database**
3. Select **Blob**
4. Choose a name (e.g., "luj-project-uploads")
5. Copy the **BLOB_READ_WRITE_TOKEN**
6. Add it to your environment variables:
   - Go to Project Settings > Environment Variables
   - Add `BLOB_READ_WRITE_TOKEN` with the token value
   - Click **Save**

## Step 5: Run Database Migrations

The migrations will run automatically during deployment via the build command.

If you need to run them manually:
```bash
# Using Vercel CLI
vercel env pull .env.production.local
npx prisma migrate deploy
```

## Step 6: Create First User

After deployment, you'll need to create your first user. You can either:

### Option A: Create a seed script
Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('your-password', 10)
  
  await prisma.user.upsert({
    where: { email: 'admin@lujproject.com' },
    update: {},
    create: {
      email: 'admin@lujproject.com',
      passwordHash,
      name: 'Admin',
    },
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Then run: `npx prisma db seed`

### Option B: Use Prisma Studio
```bash
vercel env pull .env.production.local
npx prisma studio
# Add user directly in the UI
```

## Step 7: Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Go to **Settings** > **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update `AUTH_URL` and `NEXT_PUBLIC_APP_URL` environment variables with your custom domain

## Environment Variables Checklist

Make sure all these are set in Vercel:

- ✅ `DATABASE_URL` - Postgres connection (pooled)
- ✅ `DIRECT_URL` - Postgres connection (direct)
- ✅ `AUTH_SECRET` - NextAuth secret
- ✅ `AUTH_URL` - Your app URL
- ✅ `BLOB_READ_WRITE_TOKEN` - Blob storage token
- ✅ `NEXT_PUBLIC_APP_URL` - Public app URL

## Post-Deployment

1. **Test the deployment:**
   - Visit your Vercel URL
   - Try logging in
   - Create a test project
   - Upload a template
   - Upload a dataset
   - Generate badges

2. **Monitor logs:**
   - Go to your project in Vercel Dashboard
   - Click on **Logs** tab
   - Watch for any errors

3. **Set up continuous deployment:**
   - Every push to `master` branch will auto-deploy
   - Pull requests will get preview deployments

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` and `DIRECT_URL` are correct
- Check if database is in the same region as your deployment
- Ensure SSL mode is enabled: `?sslmode=require`

### Migration Issues
- Check build logs in Vercel
- Ensure `prisma migrate deploy` runs during build
- Verify migrations folder is committed to git

### Authentication Issues
- Verify `AUTH_SECRET` is set
- Check `AUTH_URL` matches your deployment URL
- Ensure it ends with your domain (no trailing slash)

### Blob Storage Issues
- Verify `BLOB_READ_WRITE_TOKEN` is set correctly
- Check if Blob storage is in the same Vercel account

## Useful Commands

```bash
# Pull environment variables locally
vercel env pull

# View deployment logs
vercel logs

# Rollback to previous deployment
vercel rollback

# Run production build locally
npm run build
npm start
```

## Next Steps

1. Set up monitoring (e.g., Vercel Analytics)
2. Configure error tracking (e.g., Sentry)
3. Set up automated backups for the database
4. Add rate limiting for API routes
5. Set up email notifications for exports

---

**Your Project URLs:**
- GitHub: https://github.com/WGhaly/event-support-bot
- Vercel: (Will be generated after deployment)
- Database: (Create in Vercel Dashboard)

Good luck with your deployment! 🚀
