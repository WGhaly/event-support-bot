# Quick Start: Deploy to Vercel

Follow these steps to get your app deployed to production quickly.

## 1. Connect to Vercel

1. Visit [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `WGhaly/event-support-bot`
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `id-card-platform`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

**⚠️ IMPORTANT: Do NOT click Deploy yet!**

---

## 2. Create PostgreSQL Database

### Option A: Vercel Postgres (Easiest)

1. In Vercel dashboard, go to your project
2. Click **Storage** tab
3. Click **Create Database** → Select **Postgres**
4. Choose a database name (e.g., `event-support-bot`)
5. Select region closest to your users
6. Click **Create**

Once created, Vercel will automatically add these environment variables:
- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`

### Option B: External PostgreSQL

Use Neon, Supabase, Railway, or any PostgreSQL provider:

1. Create a new PostgreSQL database
2. Get your connection string
3. Keep it ready for the next step

---

## 3. Configure Environment Variables

In Vercel project → **Settings** → **Environment Variables**, add:

```bash
# If using Vercel Postgres:
DATABASE_URL=$POSTGRES_URL
DIRECT_URL=$POSTGRES_URL_NON_POOLING

# If using external PostgreSQL:
DATABASE_URL=postgres://user:pass@host:5432/dbname?sslmode=require
DIRECT_URL=postgres://user:pass@host:5432/dbname?sslmode=require

# Generate this with: openssl rand -base64 32
AUTH_SECRET=your-generated-secret-here

# Will be auto-filled after deployment
AUTH_URL=https://your-app.vercel.app

# Your app URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Generate AUTH_SECRET locally:

```bash
openssl rand -base64 32
```

Copy the output and paste it as the `AUTH_SECRET` value.

---

## 4. Add Vercel Blob Storage

1. In your project, go to **Storage** tab
2. Click **Create Database** → Select **Blob**
3. Name it (e.g., `uploads`)
4. Click **Create**

Vercel will automatically set `BLOB_READ_WRITE_TOKEN`.

---

## 5. Deploy

Click **Deploy** button in Vercel!

Wait 2-5 minutes for the build to complete.

---

## 6. Set Up Database (After First Deploy)

You have two options:

### Option A: Using Local CLI (Recommended)

```bash
# Set your production database URL
export DATABASE_URL="your-postgres-connection-string"

# Navigate to project
cd id-card-platform

# Run migrations
npx prisma generate
npx prisma db push

# Seed database
npx prisma db seed
```

### Option B: Using the Setup Script

```bash
cd id-card-platform
export DATABASE_URL="your-postgres-connection-string"
./scripts/setup-production.sh
```

---

## 7. Update AUTH_URL

After deployment:

1. Copy your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. Go to **Settings** → **Environment Variables**
3. Update `AUTH_URL` to your actual URL
4. Click **Save**
5. Redeploy: **Deployments** → **[Latest]** → **"..."** → **Redeploy**

---

## 8. First Login

1. Visit your deployed app: `https://your-app.vercel.app`
2. Click **Sign In**
3. Use super admin credentials:
   - **Email**: `superadmin@luuj.com`
   - **Password**: `SuperAdmin123!`

4. **IMPORTANT**: Change your password immediately!
   - Go to Profile/Settings
   - Update password

---

## 9. Create Your First User

1. Navigate to **Super Admin** → **User Management**
2. Click **Create User**
3. Add user details
4. Assign module access (Badge Creation)
5. Test login with new user

---

## Environment Variables Checklist

Make sure these are all set in Vercel:

- ✅ `DATABASE_URL`
- ✅ `DIRECT_URL`
- ✅ `AUTH_SECRET`
- ✅ `AUTH_URL`
- ✅ `BLOB_READ_WRITE_TOKEN`
- ✅ `NEXT_PUBLIC_APP_URL`

---

## Troubleshooting

### "Prisma Client validation failed"

```bash
# Regenerate Prisma Client locally
npx prisma generate

# Commit and push
git add .
git commit -m "Regenerate Prisma client"
git push
```

### "Database connection failed"

- Check `DATABASE_URL` includes `?sslmode=require`
- Verify database is accessible from Vercel's region
- Test connection string locally first

### "AUTH_SECRET not set"

- Generate: `openssl rand -base64 32`
- Add to environment variables in Vercel
- Redeploy

---

## Next Steps

1. ✅ Set up custom domain (optional)
2. ✅ Enable analytics in Vercel
3. ✅ Configure email notifications
4. ✅ Set up monitoring/alerts
5. ✅ Create regular database backups

---

## Need Help?

- 📖 [Full Deployment Guide](./DEPLOYMENT.md)
- 🐛 Check Vercel logs: Project → Deployments → [Latest] → View Function Logs
- 💬 Review error messages carefully

---

**🎉 You're live! Start creating badges and managing events!**
