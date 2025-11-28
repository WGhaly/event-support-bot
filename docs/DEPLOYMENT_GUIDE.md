# Deployment Guide - ID Card Automation Platform

Complete guide to deploying the ID Card Automation Platform to production.

## 📋 Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All TypeScript errors resolved (`npx tsc --noEmit`)
- [ ] Linting passes (`npm run lint`)
- [ ] Database migrations tested (`npx prisma migrate deploy`)
- [ ] Environment variables documented
- [ ] Performance benchmarks validated

### 2. Security Review
- [ ] NEXTAUTH_SECRET generated and secure (32+ characters)
- [ ] Database credentials secured (not in code)
- [ ] Vercel Blob token secured (not in code)
- [ ] File upload limits enforced (5MB templates, 10MB datasets)
- [ ] Session timeout configured (default 30 days)
- [ ] CORS configured correctly

### 3. Database Preparation
- [ ] SQLite development database backed up
- [ ] PostgreSQL production database provisioned
- [ ] Migration files reviewed
- [ ] Connection string tested

### 4. Storage Preparation
- [ ] Vercel Blob storage created
- [ ] Token permissions verified (read/write)
- [ ] Storage limits understood (Free: 10GB)
- [ ] Retention policy configured (optional)

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Best for: Quick deployment, automatic scaling, integrated Blob storage

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Create Vercel Blob Storage

```bash
vercel blob create id-card-platform-storage
```

**Output**:
```
✓ Created Vercel Blob store: id-card-platform-storage
✓ Token: vercel_blob_rw_XXXXXXXXXX
```

**Save the token** - you'll need it for environment variables.

#### Step 4: Create PostgreSQL Database

```bash
vercel postgres create id-card-platform-db
```

**Output**:
```
✓ Created PostgreSQL database: id-card-platform-db
✓ Connection string: postgres://user:pass@host/db
```

**Save the connection string** - you'll need it for `DATABASE_URL`.

#### Step 5: Update Prisma Schema for PostgreSQL

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

#### Step 6: Deploy to Vercel

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Select your account/team
- **Link to existing project?** No (first time)
- **Project name?** id-card-platform
- **Directory?** ./
- **Override settings?** No

**Deployment URL**: `https://id-card-platform-xyz.vercel.app`

#### Step 7: Configure Environment Variables

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Add the following:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | `postgres://user:pass@host/db` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://your-preview.vercel.app` | Preview |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_XXXXXXXXXX` | Production, Preview, Development |

**Important**: Click "Add" after each variable.

#### Step 8: Run Database Migrations

```bash
# Set DATABASE_URL locally to production database
export DATABASE_URL="postgres://user:pass@host/db"

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

#### Step 9: Redeploy

```bash
vercel --prod
```

#### Step 10: Verify Deployment

1. Visit your deployment URL
2. Test signup flow
3. Create a project
4. Upload a template
5. Generate a badge
6. Download ZIP

### Option 2: Railway

Best for: Simple deployment with managed database

#### Step 1: Create Railway Account

Go to [Railway.app](https://railway.app) and sign up with GitHub.

#### Step 2: Create New Project from GitHub

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway will auto-detect Next.js

#### Step 3: Add PostgreSQL Database

1. Click "+ New" in your project
2. Select "Database" → "PostgreSQL"
3. Wait for provisioning
4. Copy `DATABASE_URL` from Variables tab

#### Step 4: Configure Environment Variables

In your Railway project → Variables tab:

```env
DATABASE_URL=postgres://user:pass@host/db (auto-filled by Railway)
NEXTAUTH_SECRET=<generate with openssl rand -base64 32>
NEXTAUTH_URL=https://your-app.railway.app
BLOB_READ_WRITE_TOKEN=<your-vercel-blob-token>
```

#### Step 5: Update Prisma Schema

Same as Vercel - change to `postgresql`.

#### Step 6: Deploy

Railway auto-deploys on push. To manually deploy:
1. Go to Deployments tab
2. Click "Deploy Now"

#### Step 7: Run Migrations

Railway provides a shell:
1. Go to your service → Shell
2. Run:
```bash
npx prisma migrate deploy
npx prisma generate
```

#### Step 8: Set Up Custom Domain (Optional)

1. Go to Settings → Domains
2. Add custom domain
3. Configure DNS records as instructed

### Option 3: Render

Best for: Free tier with minimal setup

#### Step 1: Create Render Account

Go to [Render.com](https://render.com) and sign up.

#### Step 2: Create PostgreSQL Database

1. Click "New" → "PostgreSQL"
2. Name: `id-card-platform-db`
3. Plan: Free (limited to 90 days) or Starter ($7/mo)
4. Click "Create Database"
5. Copy "Internal Database URL"

#### Step 3: Create Web Service

1. Click "New" → "Web Service"
2. Connect GitHub repository
3. Configure:
   - **Name**: id-card-platform
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`

#### Step 4: Add Environment Variables

In Web Service → Environment:

```env
DATABASE_URL=<internal-database-url>
NEXTAUTH_SECRET=<generate-with-openssl>
NEXTAUTH_URL=https://id-card-platform.onrender.com
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
NODE_VERSION=18
```

#### Step 5: Deploy

Render auto-deploys on push. First deployment takes 5-10 minutes.

#### Step 6: Verify

Visit `https://your-app.onrender.com`

### Option 4: DigitalOcean App Platform

Best for: Full control with managed infrastructure

#### Step 1: Create DigitalOcean Account

Go to [DigitalOcean](https://digitalocean.com) and sign up.

#### Step 2: Create Managed PostgreSQL Database

1. Navigate to Databases → Create
2. Select PostgreSQL
3. Choose plan (Basic $15/mo)
4. Select region (closest to users)
5. Click "Create Database Cluster"
6. Wait for provisioning (~5 minutes)
7. Go to Connection Details → Copy connection string

#### Step 3: Create App from GitHub

1. Navigate to Apps → Create App
2. Select GitHub repository
3. Configure:
   - **Branch**: main
   - **Autodeploy**: Yes
   - **Build Command**: `npm install && npx prisma generate`
   - **Run Command**: `npm start`

#### Step 4: Configure Environment Variables

In App Settings → Environment Variables:

```env
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
NEXTAUTH_SECRET=<generate>
NEXTAUTH_URL=https://your-app.ondigitalocean.app
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
```

#### Step 5: Run Database Migrations

Use DigitalOcean Console:
1. Go to your app → Console tab
2. Run:
```bash
npx prisma migrate deploy
```

#### Step 6: Deploy

Click "Deploy" in the App Platform dashboard.

## 🔧 Post-Deployment Configuration

### 1. Database Migrations

After deployment, always run migrations:

```bash
# Set DATABASE_URL to production
export DATABASE_URL="postgres://user:pass@host/db"

# Run migrations
npx prisma migrate deploy

# Verify
npx prisma db pull
```

### 2. Create Admin User (Optional)

If you want to pre-create admin accounts:

```bash
# Connect to production database
npx prisma studio

# Or use psql
psql $DATABASE_URL

# Insert admin user (password: hashed with bcrypt)
INSERT INTO users (id, email, password, name, "createdAt")
VALUES (
  'admin-001',
  'admin@example.com',
  '$2b$10$<hashed-password>',
  'Admin User',
  CURRENT_TIMESTAMP
);
```

**Generate hashed password**:
```javascript
// In Node.js console
const bcrypt = require('bcrypt');
bcrypt.hash('your-password', 10).then(console.log);
```

### 3. Configure Vercel Blob Retention

To auto-delete old exports:

```bash
# Not yet supported by Vercel Blob
# Implement custom cleanup with cron job:
# vercel cron create --every "0 0 * * *" --endpoint "/api/cron/cleanup"
```

**Create cleanup API route** (`src/app/api/cron/cleanup/route.ts`):

```typescript
import { list, del } from '@vercel/blob';

export async function GET() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const blobs = await list({ prefix: 'exports/' });
  
  for (const blob of blobs.blobs) {
    if (new Date(blob.uploadedAt) < thirtyDaysAgo) {
      await del(blob.url);
    }
  }
  
  return Response.json({ deleted: blobs.blobs.length });
}
```

### 4. Set Up Monitoring

#### Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `src/app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Error Tracking with Sentry

```bash
npm install @sentry/nextjs
```

Initialize:
```bash
npx @sentry/wizard@latest -i nextjs
```

Add DSN to environment variables:
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### 5. Custom Domain Configuration

#### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS:
   - Type: `CNAME`
   - Name: `@` or `www`
   - Value: `cname.vercel-dns.com`

#### Railway
1. Go to Settings → Domains
2. Add custom domain
3. Add DNS records as instructed

#### Render
1. Go to Settings → Custom Domains
2. Add domain
3. Configure DNS with provided CNAME

## 🔒 Security Hardening

### 1. Environment Variables

**Never commit** `.env` files. Use platform-specific secret management:

- **Vercel**: Environment Variables in dashboard
- **Railway**: Variables tab
- **Render**: Environment tab
- **DigitalOcean**: App Settings → Environment Variables

### 2. HTTPS Enforcement

All platforms provide automatic HTTPS. Verify by checking:
```bash
curl -I https://your-domain.com
# Should return: Strict-Transport-Security header
```

### 3. Rate Limiting (Optional)

Install rate limiter:
```bash
npm install express-rate-limit
```

Add middleware (`src/middleware.ts`):
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const max = 100; // requests per window

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    const data = rateLimit.get(ip);
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
    } else {
      data.count++;
      if (data.count > max) {
        return new NextResponse('Too Many Requests', { status: 429 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### 4. Database Connection Pooling

For PostgreSQL, use connection pooling:

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Optional: for migrations
}
```

Add to environment:
```env
DATABASE_URL=postgres://user:pass@host/db?connection_limit=10&pool_timeout=20
```

## 📊 Monitoring & Maintenance

### 1. Health Checks

Create health endpoint (`src/app/api/health/route.ts`):

```typescript
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Vercel Blob (optional)
    // await list({ limit: 1 });
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    );
  }
}
```

### 2. Logging

View logs:

**Vercel**:
```bash
vercel logs
```

**Railway**:
Dashboard → Deployments → View Logs

**Render**:
Dashboard → Logs tab

**DigitalOcean**:
App → Runtime Logs

### 3. Database Backups

**Vercel Postgres**: Automatic daily backups (paid plans)

**Railway**: Automatic backups

**Render**: Automatic daily backups

**DigitalOcean**: Configure in Database settings

**Manual backup**:
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### 4. Performance Monitoring

Monitor key metrics:
- **Response Time**: Target <500ms for API routes
- **Badge Generation**: Target <60s for 100 badges
- **ZIP Creation**: Target <20s for 100 badges
- **Database Queries**: Target <100ms
- **Error Rate**: Target <1%

## 🐛 Troubleshooting

### Issue: Database Connection Fails

**Check**:
```bash
psql $DATABASE_URL
```

**Fix**:
1. Verify connection string format
2. Check SSL mode: add `?sslmode=require` to connection string
3. Verify database is running
4. Check firewall rules

### Issue: Migrations Fail

**Error**: "Migration already applied"

**Fix**:
```bash
npx prisma migrate resolve --applied <migration-name>
```

**Error**: "Database drift detected"

**Fix**:
```bash
npx prisma migrate reset # WARNING: Deletes all data
npx prisma migrate deploy
```

### Issue: Vercel Blob Upload Fails

**Check token**:
```bash
curl https://blob.vercel-storage.com/test.txt \
  -H "Authorization: Bearer $BLOB_READ_WRITE_TOKEN"
```

**Fix**:
1. Regenerate token in Vercel Dashboard
2. Update environment variables
3. Redeploy

### Issue: Build Fails

**Common causes**:
1. TypeScript errors: Run `npx tsc --noEmit` locally
2. Missing dependencies: Run `npm install`
3. Prisma generation failed: Run `npx prisma generate`

**Fix**: Check build logs and resolve errors locally first.

### Issue: Slow Performance

**Check**:
1. Database indexes: Run `EXPLAIN ANALYZE` on slow queries
2. Vercel Blob region: Use same region as database
3. Image sizes: Reduce template resolution
4. N+1 queries: Use Prisma `include` for relations

## 📈 Scaling Considerations

### Horizontal Scaling

All platforms auto-scale:
- **Vercel**: Automatic (serverless)
- **Railway**: Manual scaling in dashboard
- **Render**: Upgrade to scalable plans
- **DigitalOcean**: Adjust instance count

### Database Scaling

**Connection pooling**:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")?connection_limit=50
}
```

**Read replicas** (for high traffic):
- Vercel Postgres: Enterprise plan
- Railway: Not supported
- Render: Available on Pro plans
- DigitalOcean: Configure in database settings

### Blob Storage Scaling

**Vercel Blob limits**:
- Free: 10GB, 10K requests/month
- Pro: 1TB, 10M requests/month
- Enterprise: Unlimited

**Consider CDN** for serving badges frequently (already included in Vercel Blob).

## ✅ Deployment Success Checklist

- [ ] Application accessible at production URL
- [ ] User signup/signin works
- [ ] Project creation works
- [ ] Template upload works (test with 5MB image)
- [ ] Visual editor loads and saves fields
- [ ] CSV/Excel import works (test with 100+ rows)
- [ ] Field mapping creates correctly
- [ ] Badge generation completes (test with 10 badges)
- [ ] Individual badge download works
- [ ] ZIP download works
- [ ] Export deletion works (verify Blob cleanup)
- [ ] Health check endpoint returns 200
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring/logging set up
- [ ] Error tracking enabled
- [ ] Backup strategy configured

## 📞 Support

If you encounter issues during deployment:

1. Check platform-specific documentation
2. Review application logs
3. Verify environment variables
4. Test locally with production database
5. Open GitHub issue with details

---

**Deployment Complete!** 🎉

Your ID Card Automation Platform is now live and ready for production use.
