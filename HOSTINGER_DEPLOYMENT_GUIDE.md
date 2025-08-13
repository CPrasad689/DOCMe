# DOCMe Hostinger Deployment Guide - Complete File Conversion Platform

## 🚀 Overview
This guide will help you deploy your DOCMe application with 25+ file format support to Hostinger hosting.

## 📋 Hostinger Requirements

### Hosting Plan Requirements
- **Business Plan or Higher** (required for Node.js support)
- **File Storage**: At least 10GB for temporary file processing
- **Memory**: 1GB+ RAM recommended
- **Node.js Version**: 18.x or higher

### Hostinger Features Needed
- Node.js hosting capability
- File upload permissions
- Custom domain support
- SSL certificate (included)

## 🛠️ Pre-Deployment Setup

### 1. Prepare Your Files
```bash
# Build the frontend
npm run build

# Prepare API files
cd api
npm install --production
```

### 2. Environment Configuration
Create `api/.env.production`:
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
MAX_FILE_SIZE=104857600
UPLOAD_DIR=./uploads
TEMP_DIR=./temp
SESSION_SECRET=your-super-secure-session-secret-32-chars
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_CREDENTIALS=true

# Payment Integration
RAZORPAY_KEY_ID=your_production_razorpay_key
RAZORPAY_KEY_SECRET=your_production_razorpay_secret
STRIPE_SECRET_KEY=your_production_stripe_key

# File Conversion Settings
CONVERSION_TIMEOUT=300000
MAX_CONCURRENT_CONVERSIONS=5
AUTO_CLEANUP_HOURS=24
```

## 📁 File Structure for Hostinger

Your Hostinger file structure should look like this:
```
public_html/
├── index.html (from dist folder)
├── assets/ (from dist folder)
├── api/
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   └── services/
│   ├── package.json
│   ├── .env
│   └── uploads/ (create this folder)
└── .htaccess
```

## 🚀 Step-by-Step Deployment

### Step 1: Upload Frontend Files
1. Build your frontend: `npm run build`
2. Upload contents of `dist` folder to `public_html`
3. Ensure `index.html` is in the root of `public_html`

### Step 2: Upload API Files
1. Create `api` folder in `public_html`
2. Upload all files from your `api` directory
3. Create `uploads` folder: `mkdir public_html/api/uploads`
4. Set permissions: `chmod 755 public_html/api/uploads`

### Step 3: Configure Web Server
Create `public_html/.htaccess`:
```apache
# Enable rewrite engine
RewriteEngine On

# Handle Node.js API routes
RewriteCond %{REQUEST_URI} ^/api/(.*)$
RewriteRule ^api/(.*)$ /api/src/server.js [L,QSA]

# Handle React Router (SPA routing)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
    Header set Cache-Control "public, immutable"
</FilesMatch>

# Compress files
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# File upload limits
LimitRequestBody 104857600

# Prevent access to sensitive files
<FilesMatch "\.(env|log|sql)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

### Step 4: Install Dependencies on Hostinger
```bash
# SSH into your Hostinger account
ssh username@yourdomain.com

# Navigate to API directory
cd public_html/api

# Install production dependencies
npm install --production

# Install additional conversion libraries
npm install sharp pdf-lib mammoth xlsx officegen archiver unzipper jimp
```

### Step 5: Start Node.js Application
In Hostinger control panel:
1. Go to **Advanced** → **Node.js**
2. Create new Node.js app
3. Set **Application Root**: `/public_html/api`
4. Set **Application Startup File**: `src/server.js`
5. Set **Node.js Version**: 18.x or higher
6. Click **Create**

### Step 6: Configure Environment Variables
In Hostinger Node.js settings:
1. Add all environment variables from your `.env.production` file
2. Set `NODE_ENV=production`
3. Set `PORT=3001` (or as assigned by Hostinger)

## 🔧 Hostinger-Specific Optimizations

### 1. File Processing Optimization
```javascript
// Add to api/src/config/hostinger.js
export const hostingerConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB for Hostinger
  maxConcurrentConversions: 3, // Limit concurrent processing
  tempFileRetention: 2 * 60 * 60 * 1000, // 2 hours
  enableCompression: true,
  optimizeImages: true
};
```

### 2. Memory Management
```javascript
// Add memory monitoring
const monitorMemory = () => {
  const used = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(used.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(used.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(used.heapUsed / 1024 / 1024) + 'MB'
  });
};

setInterval(monitorMemory, 60000); // Check every minute
```

### 3. File Cleanup Automation
```javascript
// Add to server.js
import cron from 'node-cron';

// Clean up old files every hour
cron.schedule('0 * * * *', async () => {
  try {
    const uploadsDir = './uploads';
    const files = await fs.readdir(uploadsDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      const ageHours = (now - stats.mtime.getTime()) / (1000 * 60 * 60);
      
      if (ageHours > 24) { // Delete files older than 24 hours
        await fs.unlink(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
});
```

## 🧪 Testing on Hostinger

### 1. Test File Conversion API
```bash
# Test supported formats
curl https://yourdomain.com/api/conversion/formats

# Test file upload (use a small test file)
curl -X POST https://yourdomain.com/api/conversion/convert \
  -F "file=@test.txt" \
  -F "targetFormat=pdf"
```

### 2. Test All 25 Formats
Create test files for each format and verify conversions:

**Documents**: DOC → PDF, DOCX → TXT, PDF → HTML, etc.
**Images**: JPG → PNG, PNG → WebP, BMP → JPEG, etc.
**Spreadsheets**: XLSX → CSV, CSV → JSON, etc.
**Presentations**: PPTX → PDF, PPT → HTML, etc.
**E-books**: EPUB → TXT, MOBI → HTML, etc.

### 3. Performance Testing
```bash
# Test batch conversion
curl -X POST https://yourdomain.com/api/conversion/batch-convert \
  -F "files=@test1.txt" \
  -F "files=@test2.jpg" \
  -F "targetFormat=pdf"
```

## 📊 Monitoring & Maintenance

### 1. Log Monitoring
```bash
# Check application logs
tail -f /path/to/your/app/logs/app.log

# Monitor conversion statistics
curl https://yourdomain.com/api/conversion/stats
```

### 2. Performance Optimization
- **Enable Gzip compression** in .htaccess
- **Optimize images** before conversion
- **Limit concurrent conversions** to prevent memory issues
- **Implement file cleanup** to manage storage

### 3. Error Handling
- Monitor failed conversions
- Set up email alerts for critical errors
- Implement retry mechanisms for failed conversions

## 🔒 Security Considerations

### 1. File Upload Security
- Validate file types and sizes
- Scan for malicious content
- Limit upload rates per IP
- Implement virus scanning if possible

### 2. Server Security
- Keep Node.js and dependencies updated
- Use HTTPS only
- Implement proper error handling
- Monitor for suspicious activity

## 💰 Cost Optimization

### 1. Storage Management
- Automatic file cleanup after 24 hours
- Compress large files before processing
- Use efficient image formats (WebP, AVIF)

### 2. Processing Optimization
- Limit concurrent conversions
- Implement queue system for high load
- Cache frequently converted files

## 🚀 Production Checklist

- [ ] Frontend built and uploaded to `public_html`
- [ ] API files uploaded to `public_html/api`
- [ ] Node.js app created in Hostinger panel
- [ ] Environment variables configured
- [ ] File permissions set correctly
- [ ] .htaccess configured for routing
- [ ] SSL certificate enabled
- [ ] Domain pointed to Hostinger
- [ ] All 25 file formats tested
- [ ] Batch conversion tested
- [ ] Download functionality verified
- [ ] Error handling tested
- [ ] Performance monitoring enabled
- [ ] File cleanup automation active

## 📞 Support

If you encounter issues:
1. Check Hostinger Node.js logs
2. Verify file permissions (755 for directories, 644 for files)
3. Test API endpoints individually
4. Monitor memory usage
5. Check file upload limits

Your DOCMe application with 25+ file format support is now ready for Hostinger deployment! 🎉

## 🎯 Key Features Deployed

✅ **25+ File Formats**: Complete conversion matrix
✅ **Real-time Processing**: Instant conversion feedback
✅ **Batch Processing**: Multiple files at once
✅ **Download Management**: Secure file delivery
✅ **Auto Cleanup**: 24-hour file retention
✅ **Performance Optimized**: Memory and storage efficient
✅ **Production Ready**: Hostinger-optimized configuration