# DOCMe Complete Testing Guide

## 🚀 Quick Start Testing

### Prerequisites Installation

1. **Install Node.js 18+**
   ```bash
   # Download from https://nodejs.org/
   node --version  # Should be 18.0.0 or higher
   npm --version   # Should be 8.0.0 or higher
   ```

2. **Install VSCode Extensions**
   ```
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - TypeScript and JavaScript Language Features
   - ESLint
   - Prettier - Code formatter
   - Thunder Client (for API testing)
   ```

3. **Clone and Setup Project**
   ```bash
   git clone <your-repo-url>
   cd docme-app
   npm install
   cd api && npm install && cd ..
   ```

### Environment Setup

1. **Create Environment Files**
   ```bash
   # Copy example files
   cp .env.example .env
   cp api/.env.example api/.env
   ```

2. **Configure Supabase**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Get URL and anon key from Settings > API
   - Update `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Setup Database**
   ```bash
   # Run migrations
   cd api
   npm run db:migrate
   ```

4. **Configure Stripe**
   - Go to [stripe.com](https://stripe.com)
   - Create account and get test keys
   - Update `.env` files with Stripe keys

### Running the Application

1. **Start API Server**
   ```bash
   cd api
   npm run dev
   # Server runs on http://localhost:3001
   ```

2. **Start Frontend (New Terminal)**
   ```bash
   npm run dev
   # App runs on http://localhost:5173
   ```

3. **Verify Setup**
   - Open http://localhost:5173
   - Check browser console for errors
   - Test file upload functionality

### 5. Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test supported formats
curl http://localhost:3001/api/conversion/formats
```

## 🧪 Testing Procedures

### 1. Frontend Testing

#### Unit Tests
```bash
npm run test
npm run test:coverage
```

#### Component Testing
```bash
# Test individual components
npm run test -- --testPathPattern=components
```

#### E2E Testing with Cypress
```bash
npm install cypress --save-dev
npx cypress open
```

### 2. API Testing

#### Unit Tests
```bash
cd api
npm run test
npm run test:coverage
```

#### Integration Tests
```bash
cd api
npm run test:integration
```

#### Manual API Testing
Use Thunder Client in VSCode or Postman:

**Test Authentication:**
```http
POST http://localhost:3001/api/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

**Test File Conversion:**
```http
POST http://localhost:3001/api/conversion/convert
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

file: [upload a test file]
targetFormat: pdf
aiEnhanced: true
```

### 3. Database Testing

#### Test Database Connections
```bash
cd api
node -e "
const { supabase } = require('./dist/server.js');
supabase.from('users').select('count').then(console.log);
"
```

#### Test Migrations
```bash
cd api
npm run db:migrate
# Check Supabase dashboard for tables
```

### 4. Payment Testing

#### Stripe Test Cards
```
Success: 4242424242424242
Decline: 4000000000000002
3D Secure: 4000002500003155
```

#### Test Subscription Flow
1. Go to pricing page
2. Click "Start Pro Trial"
3. Use test card: 4242424242424242
4. Verify webhook receives events
5. Check user plan updated in database

### 5. File Conversion Testing

#### Test Different File Types
```bash
# Create test files
echo "Test content" > test.txt
echo '{"name": "test", "value": 123}' > test.json
# Create a simple CSV
echo "name,age,city\nJohn,25,NYC\nJane,30,LA" > test.csv
# Upload via UI and convert to PDF
```

#### Test Video/Audio Conversion
```bash
# Test with sample media files
# Download sample files from:
# https://sample-videos.com/
# Upload and test conversion between formats
```

#### Test Conversion Limits
1. Create free account
2. Try converting 6 files (should hit limit)
3. Upgrade to Pro
4. Verify unlimited conversions

#### Test AI Enhancement
1. Upload image file
2. Enable AI enhancement option
3. Compare output quality
4. Verify processing time difference

### 6. Performance Testing

#### Load Testing with Artillery
```bash
npm install -g artillery
artillery quick --count 10 --num 5 http://localhost:5173
```

#### Memory Usage Testing
```bash
# Monitor API memory usage
cd api
node --inspect dist/server.js
# Open Chrome DevTools > Memory tab
```

### 7. Security Testing

#### Test Authentication
```bash
# Test without token
curl http://localhost:3001/api/conversion/history
# Should return 401

# Test with invalid token
curl -H "Authorization: Bearer invalid" http://localhost:3001/api/conversion/history
# Should return 401
```

#### Test File Upload Security
1. Try uploading malicious files
2. Test file size limits
3. Verify file type validation

### 8. Cross-Browser Testing

#### Manual Testing
Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

#### Test File Upload Compatibility
- Drag and drop functionality
- Click to upload
- Multiple file selection
- Large file handling
- Progress indicators

#### Automated Browser Testing
```bash
npm install --save-dev @playwright/test
npx playwright test
```

## 📱 Mobile Testing

### React Native Setup

1. **Install React Native CLI**
   ```bash
   npm install -g @react-native-community/cli
   ```

2. **iOS Setup (macOS only)**
   ```bash
   # Install Xcode from App Store
   sudo gem install cocoapods
   cd ios && pod install
   ```

3. **Android Setup**
   ```bash
   # Install Android Studio
   # Setup Android SDK and emulator
   ```

4. **Run Mobile Apps**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

### Mobile Testing Checklist
- [ ] File upload works on mobile
- [ ] Responsive design on all screen sizes
- [ ] Touch interactions work properly
- [ ] Performance is acceptable
- [ ] Push notifications work (if implemented)

## 🚀 Pre-Production Checklist

### Code Quality
- [ ] All tests pass
- [ ] ESLint warnings resolved
- [ ] TypeScript compilation clean
- [ ] Code coverage >80%
- [ ] Security audit clean (`npm audit`)

### Performance
- [ ] Lighthouse score >90
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] API response times <500ms
- [ ] Database queries optimized

### Security
- [ ] Environment variables secured
- [ ] API endpoints protected
- [ ] File uploads validated
- [ ] SQL injection prevention
- [ ] XSS protection enabled

### Functionality
- [ ] All file conversions work
- [ ] Payment flow complete
- [ ] Email notifications work
- [ ] Error handling proper
- [ ] Loading states implemented

### Deployment
- [ ] Production build works
- [ ] Environment configs set
- [ ] Database migrations run
- [ ] CDN configured
- [ ] Monitoring setup

## 🔧 Troubleshooting

### Common Issues

#### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Database connection issues
```bash
# Check Supabase URL and keys
# Verify network connectivity
# Check Supabase project status
```

#### Stripe webhook issues
```bash
# Use ngrok for local testing
npm install -g ngrok
ngrok http 3001
# Update Stripe webhook URL
```

#### File conversion failures
```bash
# Check file permissions
chmod 755 uploads/
# Verify file size limits
# Check supported formats
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# API debug mode
NODE_ENV=development npm run dev
```

### Performance Issues
```bash
# Analyze bundle size
npm run build
npm run analyze

# Profile React components
# Use React DevTools Profiler
```

## 📊 Monitoring & Analytics

### Setup Application Monitoring
```bash
# Install monitoring tools
npm install @sentry/react @sentry/node
```

### Key Metrics to Track
- Conversion success rate
- API response times
- Error rates
- User engagement
- Payment conversion rates

### Health Checks
```bash
# API health check
curl http://localhost:3001/health

# Database health check
curl http://localhost:3001/api/health/db
```

## 🚀 Deployment Testing

### Staging Deployment
1. Deploy to staging environment
2. Run full test suite
3. Test with production-like data
4. Performance testing
5. Security testing

### Production Deployment
1. Final code review
2. Database backup
3. Deploy with zero downtime
4. Post-deployment verification
5. Monitor for issues

### Environment Variables Checklist
```bash
# Required for production
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NODE_ENV=production
MAX_FILE_SIZE=1073741824
FFMPEG_PATH=/usr/bin/ffmpeg  # If using video conversion
```

### Rollback Plan
```bash
# Prepare rollback scripts
# Test rollback procedure
# Document rollback steps
# Monitor post-rollback
```

## 🔧 Additional Testing Requirements

### File Format Testing Matrix
Create test files for each supported format:

```bash
# Document formats
- test.pdf (multi-page with images)
- test.docx (with formatting)
- test.xlsx (with formulas)
- test.pptx (with animations)

# Image formats
- test.jpg (high resolution)
- test.png (with transparency)
- test.gif (animated)
- test.webp (modern format)

# Video formats
- test.mp4 (HD quality)
- test.avi (legacy format)
- test.mov (QuickTime)

# Audio formats
- test.mp3 (compressed)
- test.wav (uncompressed)
- test.flac (lossless)

# Data formats
- test.json (complex structure)
- test.csv (large dataset)
- test.xml (nested elements)
```

### Conversion Quality Testing
1. **Visual Quality**: Compare input vs output
2. **File Size**: Monitor compression ratios
3. **Processing Time**: Benchmark conversion speeds
4. **Error Handling**: Test with corrupted files
5. **Memory Usage**: Monitor server resources

### Payment Integration Testing
```bash
# Test Stripe webhooks locally
stripe listen --forward-to localhost:3001/api/webhook/stripe

# Test subscription lifecycle
1. Create subscription
2. Update payment method
3. Cancel subscription
4. Handle failed payments
5. Test webhook events
```

This comprehensive testing guide ensures your DOCMe application is production-ready across all platforms with proper quality assurance, security testing, and performance optimization.