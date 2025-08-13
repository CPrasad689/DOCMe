# DOCMe - Hostinger Deployment Configuration

## Web Deployment (hostinger.com)

### Prerequisites
1. Hostinger hosting account with Node.js support
2. Domain configured in Hostinger
3. SSL certificate (automatically provided by Hostinger)

### Build Configuration
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build (optional)
npm run preview
```

### Environment Variables (.env.production)
```env
VITE_API_URL=https://api.docme.com
VITE_RAZORPAY_KEY_ID=your_razorpay_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ENV=production
VITE_SENTRY_DSN=your_sentry_dsn
```

### Deployment Steps for Hostinger
1. Build the project locally: `npm run build`
2. Upload the `dist` folder contents to your Hostinger public_html directory
3. Configure your domain to point to the uploaded files
4. Set up SSL certificate (auto-configured by Hostinger)

### Server Configuration (.htaccess for Hostinger)
```apache
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
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
</IfModule>
```

## Android App Deployment

### Capacitor Configuration
```json
{
  "appId": "com.docme.app",
  "appName": "DOCMe",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "url": "https://docme.com",
    "allowNavigation": [
      "docme.com",
      "api.docme.com",
      "razorpay.com"
    ]
  },
  "android": {
    "allowMixedContent": true,
    "captureInput": true,
    "webContentsDebuggingEnabled": false
  }
}
```

### Android Build Steps
```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Add Android platform
npx cap add android

# Build web assets
npm run build

# Copy web assets to native project
npx cap copy android

# Open Android Studio
npx cap open android
```

### Android Permissions (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.DOWNLOAD_WITHOUT_NOTIFICATION" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## iOS App Deployment

### iOS Configuration
```json
{
  "ios": {
    "contentInset": "automatic",
    "scrollEnabled": true,
    "backgroundColor": "#ffffff"
  }
}
```

### iOS Build Steps
```bash
# Add iOS platform
npx cap add ios

# Build web assets
npm run build

# Copy web assets to native project
npx cap copy ios

# Open Xcode
npx cap open ios
```

### iOS Permissions (ios/App/App/Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to scan documents</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to select images for conversion</string>
<key>NSDocumentPickerUsageDescription</key>
<string>This app needs access to pick documents for conversion</string>
```

## Additional Configuration Files

### package.json scripts addition
```json
{
  "scripts": {
    "build:web": "vite build",
    "build:android": "npm run build && npx cap copy android && npx cap open android",
    "build:ios": "npm run build && npx cap copy ios && npx cap open ios",
    "deploy:hostinger": "npm run build && echo 'Upload dist folder to Hostinger public_html'",
    "sync:android": "npx cap sync android",
    "sync:ios": "npx cap sync ios"
  }
}
```

### Docker Configuration (optional for VPS hosting)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name docme.com;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Security Considerations

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://checkout.razorpay.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://api.docme.com https://razorpay.com;">
```

### API Rate Limiting
- Implement rate limiting on the backend
- Use Cloudflare or similar CDN for DDoS protection
- Set up monitoring and alerting

## Monitoring and Analytics

### Error Tracking (Sentry)
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
});
```

### Analytics (Google Analytics)
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```
