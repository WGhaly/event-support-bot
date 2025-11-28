#!/bin/bash

# Production Migration Script
# This script sets up the production PostgreSQL database

echo "🚀 Starting production database setup..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "Please set it with your production PostgreSQL connection string"
  exit 1
fi

echo "✅ DATABASE_URL is set"

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Push schema to database (creates tables if they don't exist)
echo "🗄️  Pushing schema to database..."
npx prisma db push --accept-data-loss

# Seed the database
echo "🌱 Seeding database with initial data..."
npx prisma db seed

echo ""
echo "✅ Production database setup complete!"
echo ""
echo "📝 Important Credentials:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Super Admin:"
echo "  Email: superadmin@luuj.com"
echo "  Password: SuperAdmin123!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  Remember to change the super admin password after first login!"
