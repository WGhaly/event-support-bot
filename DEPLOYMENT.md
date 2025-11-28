# Deployment Guide - Vercel & PostgreSQL

This guide will walk you through deploying the Event Support Bot platform to Vercel with PostgreSQL database.

## Prerequisites

- GitHub account with your code pushed
- Vercel account (sign up at https://vercel.com)
- Database ready (Vercel Postgres or external provider)

---

## Step 1: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: **WGhaly/event-support-bot**
4. Select the `id-card-platform` directory as the root directory
5. **Do NOT deploy yet** - we need to set up the database first

---

## Step 2: Set Up PostgreSQL Database

### Option A: Vercel Postgres (Recommended)

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **Create Database** → Select **Postgres**
3. Choose a region close to your users
4. Click **Create**
5. Once created, go to **.env.local** tab and copy these variables:
   - `POSTGRES_URL` (use this for `DATABASE_URL`)
   - `POSTGRES_URL_NON_POOLING` (use this for `DIRECT_URL`)

### Option B: External PostgreSQL (Neon, Supabase, etc.)

1. Create a PostgreSQL database on your provider
2. Get the connection string (should look like: `postgres://user:password@host/database`)
3. Ensure SSL is enabled for security

---

## Step 3: Configure Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add:

### Required Variables:

```env
# Database
DATABASE_URL=postgres://[your-connection-string]?sslmode=require
DIRECT_URL=postgres://[your-connection-string]?sslmode=require

# Auth.js
AUTH_SECRET=[generate-with-openssl-rand-base64-32]
AUTH_URL=https://your-app-name.vercel.app

# Vercel Blob (auto-configured if using Vercel Blob)
BLOB_READ_WRITE_TOKEN=[your-vercel-blob-token]

# App URL
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### Generate AUTH_SECRET:

Run this command locally:
```bash
openssl rand -base64 32
```

Copy the output and paste as `AUTH_SECRET` value.

---

## Step 4: Update Prisma Schema for PostgreSQL

The schema needs to be updated for PostgreSQL. Run these commands locally:

```bash
cd id-card-platform

# Update DATABASE_URL in .env to point to production database
# Then run migrations
npx prisma migrate deploy

# Seed the production database
npx prisma db seed
```

**Important**: Save the super admin credentials shown after seeding:
- Email: `superadmin@luuj.com`
- Password: `SuperAdmin123!`

---

## Step 5: Deploy to Vercel

### Via Vercel Dashboard:

1. Go to your project in Vercel
2. Click **"Deployments"** tab
3. Click **"Deploy"** button
4. Wait for build to complete (~2-5 minutes)

### Or via CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd id-card-platform
vercel --prod
```

---

## Step 6: Run Database Migrations in Production

After first deployment, you need to run migrations:

### Method 1: Using Vercel CLI (Recommended)

```bash
# Set production database URL locally
export DATABASE_URL="your-production-postgres-url"

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

### Method 2: Using Vercel Project Settings

1. Go to **Settings** → **Environment Variables**
2. Ensure `DATABASE_URL` and `DIRECT_URL` are set
3. Go to **Deployments** → Click on latest deployment
4. Click **"..."** → **"Redeploy"** → Check **"Use existing build cache"**

---

## Step 7: Verify Deployment

1. Visit your deployed URL: `https://your-app-name.vercel.app`
2. You should see the landing page
3. Click **"Sign In"**
4. Login with super admin credentials:
   - Email: `superadmin@luuj.com`
   - Password: `SuperAdmin123!`
5. Navigate to **Super Admin** portal and verify all features work

---

## Post-Deployment Tasks

### 1. Set Up Vercel Blob Storage

If you haven't already:
1. Go to **Storage** tab in Vercel
2. Create a **Blob** store
3. The `BLOB_READ_WRITE_TOKEN` will be auto-configured

### 2. Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update environment variables:
   - `AUTH_URL` → `https://yourdomain.com`
   - `NEXT_PUBLIC_APP_URL` → `https://yourdomain.com`
4. Redeploy

### 3. Set Up Monitoring

1. Enable **Analytics** in Vercel dashboard
2. Monitor for errors in **Logs** section
3. Set up **Alerts** for critical issues

---

## Database Seeding

The seed script creates:

### Roles (3):
- `user` - Regular users
- `admin` - Administrators
- `super-admin` - Super administrators

### Modules (3):
- Badge Creation
- Attendee Management (placeholder)
- Schedule Management (placeholder)

### Users (2):
- Super Admin: `superadmin@luuj.com` / `SuperAdmin123!`
- Test User: `w@w.com` / `12345678` (for testing)

**⚠️ Important**: Change the super admin password after first login!

---

## Troubleshooting

### Build Fails with Prisma Error

```bash
# Ensure prisma client is generated
npx prisma generate

# Commit the changes
git add .
git commit -m "Generate Prisma client"
git push
```

### Database Connection Issues

- Verify `DATABASE_URL` and `DIRECT_URL` are correct
- Ensure SSL mode is enabled: `?sslmode=require`
- Check database is accessible from Vercel's region

### "AUTH_SECRET not set" Error

- Generate a new secret: `openssl rand -base64 32`
- Add to Vercel environment variables
- Redeploy

### Blob Storage Upload Fails

- Verify `BLOB_READ_WRITE_TOKEN` is set correctly
- Ensure Vercel Blob storage is created
- Check storage limits haven't been exceeded

---

## Environment Variables Summary

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | `postgres://...` |
| `DIRECT_URL` | Direct PostgreSQL connection | ✅ | `postgres://...` |
| `AUTH_SECRET` | NextAuth secret key | ✅ | `generated-secret` |
| `AUTH_URL` | Production app URL | ✅ | `https://app.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | ✅ | `vercel_blob_...` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | ✅ | `https://app.vercel.app` |

---

## Continuous Deployment

Vercel automatically deploys when you push to the `master` branch:

```bash
# Make changes locally
git add .
git commit -m "Your commit message"
git push origin master

# Vercel will automatically build and deploy
```

---

## Security Checklist

- ✅ Change default super admin password
- ✅ Use strong `AUTH_SECRET` (32+ characters)
- ✅ Enable SSL for database connections
- ✅ Never commit `.env` files with real credentials
- ✅ Regularly update dependencies: `npm audit fix`
- ✅ Monitor error logs in Vercel dashboard
- ✅ Set up proper CORS if needed
- ✅ Enable Vercel's security headers

---

## Maintenance

### Backup Database

```bash
# Connect to your database
psql $DATABASE_URL

# Dump database
pg_dump $DATABASE_URL > backup.sql
```

### Update Dependencies

```bash
npm update
npm audit fix
git commit -am "Update dependencies"
git push
```

### Create New Migration

```bash
# Make schema changes in prisma/schema.prisma
npx prisma migrate dev --name your_migration_name

# Deploy to production
npx prisma migrate deploy
```

---

## Support

For issues or questions:
- Check Vercel logs: Project → Deployments → [Latest] → View Function Logs
- Review Prisma docs: https://www.prisma.io/docs
- NextAuth docs: https://authjs.dev

---

**🎉 Congratulations! Your Event Support Bot is now deployed to production!**
