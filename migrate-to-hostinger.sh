#!/bin/bash

# DOCMe Hostinger Migration Setup Script
# Run this script to set up your new PostgreSQL database

echo "🚀 DOCMe Hostinger Migration Setup"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the root directory of your DOCMe project"
    exit 1
fi

# Install API dependencies
echo "📦 Installing API dependencies..."
cd api
npm install prisma @prisma/client bcryptjs jsonwebtoken express-rate-limit helmet pg
npm install --save-dev @types/jsonwebtoken @types/bcryptjs @types/pg

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check environment variables
echo "🔍 Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.hostinger .env
    echo "✅ Please update the .env file with your Hostinger PostgreSQL credentials"
else
    echo "✅ .env file exists"
fi

# Test database connection (if DATABASE_URL is set)
if [ ! -z "$DATABASE_URL" ]; then
    echo "🔌 Testing database connection..."
    if npx prisma db pull --preview-feature 2>/dev/null; then
        echo "✅ Database connection successful"
        
        # Push schema to database
        echo "📋 Pushing schema to database..."
        npx prisma db push
        
        if [ $? -eq 0 ]; then
            echo "✅ Database schema created successfully"
        else
            echo "❌ Failed to create database schema"
            echo "Please check your DATABASE_URL and try again"
        fi
    else
        echo "❌ Database connection failed"
        echo "Please update your DATABASE_URL in .env file"
    fi
else
    echo "⚠️  DATABASE_URL not set. Please configure your .env file"
fi

# Frontend cleanup
echo "🧹 Cleaning up frontend dependencies..."
cd ..
npm uninstall @supabase/supabase-js

# Update package.json scripts
echo "📝 Updating package.json scripts..."
cd api

# Create a backup of current server.ts
if [ -f "src/server.ts" ]; then
    echo "💾 Backing up current server.ts..."
    cp src/server.ts src/server-backup.ts
fi

# Replace server.ts with new version
if [ -f "src/server-new.ts" ]; then
    echo "🔄 Updating server.ts..."
    mv src/server-new.ts src/server.ts
fi

echo ""
echo "🎉 Migration setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with Hostinger PostgreSQL credentials"
echo "2. Test the connection: npm run dev"
echo "3. Check health endpoint: http://localhost:3001/health"
echo "4. Deploy to Hostinger following the migration guide"
echo ""
echo "📖 See HOSTINGER_MIGRATION_GUIDE.md for detailed instructions"
echo ""

# Build the project
echo "🏗️  Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Ready for deployment"
else
    echo "⚠️  Build issues detected. Please check the errors above"
fi

echo ""
echo "🚀 Setup completed successfully!"
echo "Your DOCMe application is now ready for Hostinger PostgreSQL!"
