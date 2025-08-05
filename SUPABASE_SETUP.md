# DOCMe Supabase Setup Guide

## 🚀 Quick Setup

Your DOCMe application is now connected to the Supabase project:
- **Project URL**: `https://dntwhvaorxpzwdjzemph.supabase.co`
- **Database**: `postgresql://postgres:[YOUR-PASSWORD]@db.dntwhvaorxpzwdjzemph.supabase.co:5432/postgres`

## 📋 Setup Steps

### 1. Get Your Supabase Credentials

✅ **Already Configured:**
- **Project URL**: `https://dntwhvaorxpzwdjzemph.supabase.co`
- **Anon Key**: ✅ Integrated and ready to use
- **Service Role Key**: ✅ Integrated and ready to use

### 2. Update Environment Variables

✅ **All Keys Integrated**: Ready for full functionality

```env
# Fully configured:
VITE_SUPABASE_URL=https://dntwhvaorxpzwdjzemph.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRudHdodmFvcnhwendkanplbXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzE2MTEsImV4cCI6MjA2OTA0NzYxMX0.xVSnynjBIVZFihZ1REuz6o2142H6mhyb5yRw5tKRqbM
SUPABASE_SERVICE_ROLE_KEY=sb_secret_-7sPsKpJJUc2pGheFT0oSA_cXKMhSLp
```

### 3. Run Database Migration

Execute the database schema setup:

```bash
# Option 1: Using Supabase CLI (recommended)
npx supabase db push

# Option 2: Manual execution
# Copy the contents of supabase/migrations/create_docme_schema.sql
# Paste and run in Supabase SQL Editor
```

### 4. Verify Database Setup

Check that all tables were created:

```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
```

You should see:
- users
- subscriptions
- conversions
- usage_logs
- api_keys
- file_uploads

### 5. Configure Authentication

1. Go to **Authentication** > **Settings**
2. Configure **Site URL**: `http://localhost:5173` (development)
3. Add **Redirect URLs**:
   - `http://localhost:5173/**`
   - `https://yourdomain.com/**` (production)

### 6. Set Up Row Level Security

The migration automatically enables RLS. Verify in **Authentication** > **Policies** that policies exist for all tables.

### 7. Test Connection

```bash
# Start the application
npm run dev

# In another terminal, start the API
cd api && npm run dev

# Test database connection
curl http://localhost:3001/health
```

## 🔧 Configuration Details

### Database Schema

The following tables are created:

1. **users** - User accounts and profiles
2. **subscriptions** - Stripe subscription data
3. **conversions** - File conversion history
4. **usage_logs** - API usage tracking
5. **api_keys** - Enterprise API access
6. **file_uploads** - Temporary file tracking

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **JWT Authentication** with Supabase Auth
- **API Key Protection** for service routes
- **Data Encryption** for sensitive information

### Performance Optimizations

- **Indexes** on frequently queried columns
- **Automatic Cleanup** functions for expired data
- **Connection Pooling** for database efficiency

## 🧪 Testing Database Connection

### Test User Registration

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### Test File Conversion

```bash
# First, get auth token from signup/signin response
curl -X POST http://localhost:3001/api/conversion/convert \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test.txt" \
  -F "targetFormat=pdf"
```

### Test Subscription Creation

```bash
curl -X POST http://localhost:3001/api/subscription/create-checkout-session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_pro_monthly",
    "planType": "pro"
  }'
```

## 🚨 Important Security Notes

1. **Never commit** your service role key to version control
2. **Use environment variables** for all sensitive data
3. **Enable RLS** on all user data tables
4. **Validate all inputs** on both client and server
5. **Use HTTPS** in production

## 📊 Monitoring

Monitor your database usage in the Supabase dashboard:
- **Database** > **Usage** for storage and bandwidth
- **Authentication** > **Users** for user management
- **Logs** > **Database** for query performance

Your DOCMe application is now fully connected to Supabase and ready for development and testing!