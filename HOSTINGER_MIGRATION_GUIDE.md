# DOCMe - Hostinger PostgreSQL Migration Guide

## 🎯 Overview
This guide will help you migrate your DOCMe application from Supabase to PostgreSQL hosted on Hostinger with Prisma ORM.

## 📋 Prerequisites

### Hostinger Requirements
- Hostinger Business/Premium plan (required for PostgreSQL)
- Node.js hosting capability
- PostgreSQL database access
- File storage permissions

### Local Development
- Node.js 18+ installed
- PostgreSQL client (optional, for direct DB access)
- Git for deployment

## 🚀 Step-by-Step Migration

### 1. Set Up PostgreSQL on Hostinger

#### Create Database
1. Log in to your Hostinger control panel
2. Go to **Databases** → **PostgreSQL Databases**
3. Create a new database:
   - Database Name: `docme_database`
   - Username: `docme_user`
   - Password: Generate a strong password
4. Note down your connection details:
   - Host: `your_host.hostinger.com`
   - Port: `5432`
   - Database: `docme_database`
   - Username: `docme_user`
   - Password: `your_generated_password`

### 2. Configure Environment Variables

Create or update your `.env` file:

```bash
# Copy from .env.hostinger template
cp api/.env.hostinger api/.env

# Update with your Hostinger PostgreSQL credentials
DATABASE_URL="postgresql://docme_user:YOUR_PASSWORD@your_host.hostinger.com:5432/docme_database"

# Update other settings
FRONTEND_URL="https://yourdomain.com"
JWT_SECRET="your-super-secure-jwt-secret-32-characters-long"
NODE_ENV="production"
```

### 3. Install New Dependencies

```bash
# Navigate to API directory
cd api

# Install Prisma and PostgreSQL dependencies
npm install prisma @prisma/client bcryptjs jsonwebtoken express-rate-limit helmet pg

# Install development types
npm install --save-dev @types/jsonwebtoken @types/bcryptjs @types/pg

# Remove Supabase dependencies (if desired)
npm uninstall @supabase/supabase-js
```

### 4. Generate Prisma Client

```bash
# Generate Prisma client from schema
npx prisma generate

# Validate your schema
npx prisma validate
```

### 5. Run Database Migrations

```bash
# Push the schema to your Hostinger PostgreSQL database
npx prisma db push

# Or use migrations (recommended for production)
npx prisma migrate deploy
```

### 6. Seed Initial Data (Optional)

Create a seed file if needed:

```bash
# Create seed script
npx prisma db seed
```

### 7. Test Database Connection

```bash
# Test connection
npx prisma studio

# Or run the health check
npm run dev
# Visit: http://localhost:3001/health
```

### 8. Update Frontend Configuration

Update your frontend to remove Supabase references:

```bash
cd ../

# Remove Supabase from frontend
npm uninstall @supabase/supabase-js

# Update your API calls to use your new endpoints
```

### 9. Deploy to Hostinger

#### Option A: Manual Upload
1. Build your application:
   ```bash
   # Build API
   cd api && npm run build
   
   # Build Frontend
   cd ../ && npm run build
   ```

2. Upload files via Hostinger File Manager:
   - Upload API files to `/domains/yourdomain.com/api/`
   - Upload frontend build to `/domains/yourdomain.com/public_html/`

#### Option B: Git Deployment (Recommended)
1. Set up Git deployment in Hostinger panel
2. Push your code to the connected repository
3. Hostinger will automatically deploy

### 10. Configure Hostinger Web Server

Create `.htaccess` file in your public_html:

```apache
# Redirect API calls to Node.js server
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# Handle React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
```

### 11. Start Node.js Application

```bash
# In your Hostinger terminal or via control panel
cd /domains/yourdomain.com/api
npm start

# Or set up PM2 for process management
npm install -g pm2
pm2 start dist/server.js --name docme-api
pm2 save
pm2 startup
```

## 📊 Database Schema Features

### Modern Features Included:
- ✅ GDPR Compliance (audit logs, consent management)
- ✅ User Authentication & Authorization
- ✅ File Conversion Tracking
- ✅ Subscription Management
- ✅ Payment Processing Integration
- ✅ Security Incident Tracking
- ✅ Performance Monitoring
- ✅ Data Retention Policies

### Key Tables:
- `users` - User management with GDPR compliance
- `file_conversions` - Complete conversion tracking
- `subscriptions` - Subscription tier management
- `payments` - Payment processing logs
- `audit_logs` - GDPR audit trail
- `gdpr_requests` - Data subject requests
- `user_consents` - Consent management
- `security_incidents` - Security monitoring

## 🔧 Configuration Options

### Performance Settings
```env
# Connection pooling
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20"

# File limits
MAX_FILE_SIZE="52428800"  # 50MB

# Rate limiting
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="900000"  # 15 minutes
```

### Security Settings
```env
# JWT Configuration
JWT_SECRET="your-32-character-secret-key"
JWT_EXPIRE="24h"

# Password hashing
BCRYPT_ROUNDS="12"

# CORS
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

## 📈 Monitoring & Maintenance

### Health Checks
- API Health: `https://yourdomain.com/api/health`
- Database Stats: `https://yourdomain.com/api/stats`

### Regular Maintenance Tasks
```bash
# Clean up expired conversions (run daily)
npx prisma db seed --preview-feature

# Backup database (run weekly)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Update dependencies (run monthly)
npm audit && npm update
```

### Monitoring Queries
```sql
-- Check conversion statistics
SELECT status, COUNT(*) FROM file_conversions GROUP BY status;

-- Check user growth
SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*) 
FROM users 
WHERE "createdAt" > NOW() - INTERVAL '30 days' 
GROUP BY day ORDER BY day;

-- Monitor error rates
SELECT action, COUNT(*) 
FROM audit_logs 
WHERE "createdAt" > NOW() - INTERVAL '1 day' 
  AND metadata->>'success' = 'false'
GROUP BY action;
```

## 🚨 Troubleshooting

### Common Issues

#### Connection Issues
```bash
# Test connection
npx prisma db pull

# Check connection string format
echo $DATABASE_URL
```

#### Migration Issues
```bash
# Reset if needed (CAUTION: This deletes data)
npx prisma migrate reset

# Force push schema
npx prisma db push --force-reset
```

#### Performance Issues
```bash
# Check slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;

# Analyze table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## ✅ Verification Checklist

### Post-Migration Verification
- [ ] Database connection successful
- [ ] All tables created correctly
- [ ] User registration works
- [ ] File conversion process functional
- [ ] GDPR audit logging active
- [ ] API endpoints responding
- [ ] Frontend connecting to new API
- [ ] SSL certificate configured
- [ ] Backup strategy implemented
- [ ] Monitoring setup complete

### Performance Benchmarks
- [ ] API response time < 200ms
- [ ] File conversion time < 30s for typical files
- [ ] Database queries optimized
- [ ] Connection pooling configured
- [ ] Caching strategy implemented

## 🎉 Benefits of This Migration

### Technical Advantages
- **Better Performance**: Direct PostgreSQL queries vs. Supabase API calls
- **Cost Effective**: No per-request pricing, fixed hosting cost
- **Full Control**: Complete database access and customization
- **Type Safety**: Prisma provides excellent TypeScript integration
- **Scalability**: Easy to optimize and scale as needed

### Business Advantages
- **GDPR Compliant**: Built-in compliance features
- **Professional Setup**: Production-ready architecture
- **Monitoring**: Comprehensive logging and analytics
- **Security**: Advanced security measures and incident tracking
- **Flexibility**: Easy to extend and customize features

## 📞 Support

If you encounter issues during migration:

1. Check the troubleshooting section above
2. Verify your Hostinger PostgreSQL configuration
3. Test connection strings locally first
4. Review Prisma documentation for advanced features
5. Consider staging environment for testing

## 🔄 Rollback Plan

If you need to revert to Supabase:
1. Keep your old Supabase project active during migration
2. Update environment variables back to Supabase
3. Reinstall `@supabase/supabase-js`
4. Revert your API code changes
5. Update frontend configuration

---

**Congratulations! 🎉** Your DOCMe application is now running on a modern, scalable, and GDPR-compliant PostgreSQL database hosted on Hostinger!
