# 🚀 Deploy to Vercel using CLI

This guide walks you through deploying your Event Support Bot platform to Vercel using the command line.

## Prerequisites

✅ Vercel CLI installed (already done!)
✅ Code pushed to GitHub (already done!)

---

## Step 1: Login to Vercel

```bash
cd id-card-platform
vercel login
```

Follow the prompts to authenticate (email verification link).

---

## Step 2: Link to Existing Project or Create New

### Option A: Create New Project (First Time)

```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No
- **Project name?** → event-support-bot (or your choice)
- **Directory?** → ./ (current directory)
- **Override settings?** → No

This will:
- Create a new Vercel project
- Deploy a preview version
- Show you the preview URL

### Option B: Link to Existing Project

If you already created the project in Vercel dashboard:

```bash
vercel link
```

Follow prompts to select existing project.

---

## Step 3: Create PostgreSQL Database

### Using Vercel CLI

```bash
# Create Vercel Postgres database
vercel postgres create event-support-db
```

This creates a PostgreSQL database in your Vercel account.

### Or Manually in Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database** → **Postgres**
5. Name it `event-support-db`

---

## Step 4: Link Database to Project

```bash
# Link the database to your project
vercel env pull .env.production
```

This downloads all environment variables (including database URLs) to `.env.production`.

**Important:** The downloaded file will have `POSTGRES_URL` and `POSTGRES_URL_NON_POOLING`.

---

## Step 5: Set Required Environment Variables

You need to add the additional environment variables that aren't auto-set:

```bash
# Generate AUTH_SECRET
AUTH_SECRET=$(openssl rand -base64 32)
echo $AUTH_SECRET

# Add AUTH_SECRET to Vercel
vercel env add AUTH_SECRET production
# Paste the generated secret when prompted

# Add AUTH_URL (use your production domain)
vercel env add AUTH_URL production
# Enter: https://event-support-bot.vercel.app (or your actual domain)

# Add NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://event-support-bot.vercel.app (or your actual domain)
```

### For Vercel Blob Storage

```bash
# Create Vercel Blob storage
vercel blob create event-support-files
```

This automatically sets `BLOB_READ_WRITE_TOKEN` in your environment.

---

## Step 6: Update Environment Variable Mapping

Since Vercel Postgres creates variables with different names, we need to map them:

```bash
# Add DATABASE_URL (mapped from POSTGRES_URL)
vercel env add DATABASE_URL production
# When prompted, enter the value from POSTGRES_URL in .env.production

# Add DIRECT_URL (mapped from POSTGRES_URL_NON_POOLING)
vercel env add DIRECT_URL production
# When prompted, enter the value from POSTGRES_URL_NON_POOLING in .env.production
```

**Or use this quick script:**

```bash
# Extract values from .env.production
source .env.production
vercel env add DATABASE_URL production <<< "$POSTGRES_URL"
vercel env add DIRECT_URL production <<< "$POSTGRES_URL_NON_POOLING"
```

---

## Step 7: Deploy to Production

```bash
# Deploy to production
vercel --prod
```

This will:
- Build your application
- Run `prisma generate && next build`
- Deploy to your production domain
- Show you the production URL

**Wait for build to complete** (2-5 minutes).

---

## Step 8: Initialize Production Database

After successful deployment, initialize your database:

```bash
# Pull production database URL
vercel env pull .env.production

# Load the production environment
source .env.production

# Use the DATABASE_URL from the file
export DATABASE_URL="$POSTGRES_URL"

# Run the setup script
./scripts/setup-production.sh
```

**Or manually:**

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

You'll see the super admin credentials displayed:

```
╔════════════════════════════════════════╗
║     Production Database Initialized!    ║
╠════════════════════════════════════════╣
║  Super Admin Credentials:              ║
║  Email: superadmin@luuj.com            ║
║  Password: SuperAdmin123!              ║
╚════════════════════════════════════════╝
```

---

## Step 9: Verify Deployment

1. **Visit your production URL**
   ```bash
   vercel inspect --url
   ```
   Or check the URL from Step 7 output.

2. **Test login:**
   - Go to `/auth/login`
   - Use: `superadmin@luuj.com` / `SuperAdmin123!`

3. **Test Super Admin features:**
   - Navigate to Super Admin portal
   - Create a test user
   - Assign Badge Creation module
   - Test badge creation workflow

---

## 🔧 Useful Vercel CLI Commands

```bash
# View all environment variables
vercel env ls

# Pull environment variables to local file
vercel env pull .env.local

# View deployment logs
vercel logs

# View project info
vercel inspect

# List all deployments
vercel ls

# Open project in browser
vercel --open

# Redeploy (after changing env vars)
vercel --prod --force
```

---

## 🐛 Troubleshooting

### Build Fails with Prisma Error

```bash
# Make sure postinstall runs
vercel env add PRISMA_GENERATE_SKIP_AUTOINSTALL false production

# Redeploy
vercel --prod --force
```

### Database Connection Error

```bash
# Check if DATABASE_URL is set correctly
vercel env ls

# Verify it includes ?sslmode=require
# Should look like: postgresql://user:pass@host/db?sslmode=require

# If missing, update it:
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
```

### Environment Variables Not Loading

```bash
# Force pull latest env vars
vercel env pull .env.production --force

# Check what's loaded
cat .env.production

# Redeploy to pick up changes
vercel --prod --force
```

### AUTH_URL Mismatch

```bash
# Update to match actual deployment URL
vercel env rm AUTH_URL production
vercel env add AUTH_URL production
# Enter: https://your-actual-domain.vercel.app

# Same for NEXT_PUBLIC_APP_URL
vercel env rm NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_APP_URL production

# Redeploy
vercel --prod --force
```

---

## 📋 Complete Environment Variables Checklist

Before deploying, verify all these are set:

```bash
vercel env ls production
```

Should show:
- ✅ `DATABASE_URL` (from POSTGRES_URL)
- ✅ `DIRECT_URL` (from POSTGRES_URL_NON_POOLING)
- ✅ `AUTH_SECRET` (generated with openssl)
- ✅ `AUTH_URL` (your production URL)
- ✅ `BLOB_READ_WRITE_TOKEN` (from Vercel Blob)
- ✅ `NEXT_PUBLIC_APP_URL` (your production URL)

Plus auto-set by Vercel:
- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_DATABASE`
- `POSTGRES_HOST`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

---

## 🎯 Quick Deploy Checklist

```bash
# 1. Login
vercel login

# 2. Navigate to project
cd id-card-platform

# 3. Deploy (first time)
vercel

# 4. Create database
vercel postgres create event-support-db

# 5. Create blob storage
vercel blob create event-support-files

# 6. Pull env vars
vercel env pull .env.production

# 7. Add missing env vars
source .env.production
AUTH_SECRET=$(openssl rand -base64 32)
vercel env add AUTH_SECRET production <<< "$AUTH_SECRET"
vercel env add AUTH_URL production <<< "https://your-domain.vercel.app"
vercel env add NEXT_PUBLIC_APP_URL production <<< "https://your-domain.vercel.app"
vercel env add DATABASE_URL production <<< "$POSTGRES_URL"
vercel env add DIRECT_URL production <<< "$POSTGRES_URL_NON_POOLING"

# 8. Deploy to production
vercel --prod

# 9. Initialize database
export DATABASE_URL="$POSTGRES_URL"
./scripts/setup-production.sh

# 10. Done! 🎉
```

---

## 🔒 Security Notes

1. **Never commit `.env.production`** - it contains production credentials
2. **Change super admin password** immediately after first login
3. **Rotate AUTH_SECRET** periodically
4. **Use Vercel's environment variable encryption** (automatic)
5. **Enable Vercel Analytics** for monitoring

---

## 🚀 You're Ready!

Your platform is now deployed and running on Vercel with:
- ✅ PostgreSQL database
- ✅ Vercel Blob storage
- ✅ Secure authentication
- ✅ Production-ready configuration
- ✅ All features enabled

**Login now:** https://your-domain.vercel.app/auth/login

**Default credentials:**
- Email: `superadmin@luuj.com`
- Password: `SuperAdmin123!`

**Remember to change the password immediately!**

---

Need help? Check the [full deployment guide](./DEPLOYMENT.md) for detailed troubleshooting.
