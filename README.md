# 🚀 DOCMe - AI-Powered Document Conversion Platform

[![Deployment Status](https://img.shields.io/badge/Status-Ready%20for%20Hostinger-green)](https://github.com/CPrasad689/DOCMe)
[![GDPR Compliant](https://img.shields.io/badge/GDPR-Compliant-blue)](./src/components/pages/PrivacyPolicy.tsx)
[![AI Powered](https://img.shields.io/badge/AI-OpenRouter%20Powered-orange)](./api/src/services/openrouterService.ts)

> **AI-Enhanced File Conversion Platform** with GDPR compliance, secure processing, and enterprise-grade features. Ready for production deployment on Hostinger.

## ✨ Features

### 🤖 AI-Powered Conversion
- **25+ File Formats** supported (PDF, DOCX, TXT, MD, HTML, CSV, XLSX, etc.)
- **OpenRouter AI Integration** for intelligent content enhancement
- **Smart Format Detection** and automatic optimization
- **Batch Processing** with real-time progress tracking

### 🔒 Security & Compliance
- **GDPR Compliant** with comprehensive privacy controls
- **End-to-end Encryption** (AES-256 at rest, TLS 1.3 in transit)
- **24-hour File Deletion** policy
- **Cookie Consent** and data protection center
- **Secure Authentication** with Supabase

### 💳 Payment Integration
- **Stripe & Razorpay** payment processors
- **Subscription Management** with tier-based features
- **Usage Analytics** and conversion tracking
- **Free & Premium** tiers available

### 🌐 Production Ready
- **Hostinger Optimized** deployment configuration
- **PostgreSQL Database** with Prisma ORM
- **Environment Management** for development/production
- **CDN Ready** static assets

## 🏗️ Architecture

```
DOCMe/
├── 🎨 Frontend (React + Vite + TypeScript)
│   ├── src/components/          # UI Components
│   ├── src/pages/              # Page Components  
│   ├── src/hooks/              # Custom React Hooks
│   └── src/config/             # Configuration
│
├── ⚡ Backend API (Express + TypeScript)
│   ├── api/src/routes/         # API Endpoints
│   ├── api/src/services/       # Business Logic
│   ├── api/src/middleware/     # Security & Auth
│   └── api/prisma/             # Database Schema
│
├── 🗄️ Database (PostgreSQL + Prisma)
│   ├── User Management
│   ├── Conversion History
│   ├── Payment Records
│   └── Analytics Data
│
└── 🤖 AI Integration (OpenRouter API)
    ├── Content Enhancement
    ├── Format Optimization
    └── Intelligent Conversion
```

## 🚀 Quick Start for Hostinger

### 1. Environment Setup
Create `.env` files based on the templates:

```bash
# Frontend (.env)
VITE_API_URL=https://yourdomain.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Backend (api/.env)
DATABASE_URL=your_postgresql_url
OPENROUTER_API_KEY=sk-or-v1-your-key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
STRIPE_SECRET_KEY=your_stripe_key
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 2. Database Setup
```bash
cd api
npm install
npx prisma generate
npx prisma db push
```

### 3. Build & Deploy
```bash
# Frontend build
npm install
npm run build

# Backend setup
cd api
npm install
npm run build
```

### 4. Hostinger Deployment
- Upload `dist/` folder to public_html
- Upload `api/` folder to your Node.js app directory
- Configure environment variables in Hostinger panel
- Set up PostgreSQL database connection

## 📋 Deployment Checklist

- [x] ✅ **Repository Created** - GitHub repository ready
- [ ] ⚙️ **Environment Variables** - Configure all required env vars
- [ ] 🗄️ **Database Setup** - PostgreSQL database configured
- [ ] 🔑 **API Keys** - OpenRouter, Supabase, Stripe/Razorpay keys added
- [ ] 🌐 **Domain Configuration** - Point domain to Hostinger
- [ ] 🔒 **SSL Certificate** - Enable HTTPS
- [ ] 📊 **Analytics Setup** - Configure tracking (optional)
- [ ] 🧪 **Testing** - Verify all features work in production

## 🛠️ Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git

### Local Development
```bash
# Clone repository
git clone https://github.com/CPrasad689/DOCMe.git
cd DOCMe

# Install dependencies
npm install
cd api && npm install && cd ..

# Set up environment
cp .env.example .env
cp api/.env.example api/.env

# Start development servers
npm run dev          # Frontend (port 5173)
cd api && npm run dev # Backend (port 3001)
```

## 📊 Key Features Details

### File Conversion Engine
- **AI-Enhanced Processing**: OpenRouter integration for content improvement
- **Format Support**: 25+ file formats with intelligent conversion
- **Batch Processing**: Multiple files with progress tracking
- **Quality Optimization**: AI-powered content enhancement

### Security Implementation
- **GDPR Compliance**: Full data protection compliance
- **Encryption**: AES-256 + TLS 1.3
- **Authentication**: Supabase Auth with JWT
- **File Security**: Auto-deletion after 24 hours

### Payment System
- **Multi-Gateway**: Stripe & Razorpay support
- **Subscription Tiers**: Free, Pro, Enterprise
- **Usage Tracking**: Conversion limits and analytics
- **Secure Processing**: PCI DSS compliant

## 🔧 Configuration Files

### Key Configuration Files
- `vite.config.ts` - Frontend build configuration
- `api/package.json` - Backend dependencies
- `api/prisma/schema.prisma` - Database schema
- `tailwind.config.js` - UI styling configuration
- `.env.example` - Environment template

### Hostinger Specific Files
- `migrate-to-hostinger.sh` - Deployment script
- `HOSTINGER_MIGRATION_GUIDE.md` - Detailed migration guide
- `PRODUCTION_DEPLOYMENT.md` - Production setup guide

## 📚 Documentation

- 📖 [Hostinger Migration Guide](./HOSTINGER_MIGRATION_GUIDE.md)
- 🚀 [Production Deployment](./PRODUCTION_DEPLOYMENT.md)
- 🔒 [GDPR Compliance](./GDPR_DEPLOYMENT_COMPLETE.md)
- 💾 [Database Migration](./DATABASE_MIGRATION_BENEFITS.md)
- ✅ [Testing Guide](./COMPLETE_TESTING_GUIDE.md)

## 🤝 Support

For deployment assistance or technical support:
- 📧 Email: support@docme-in.com
- 📖 Documentation: Check the guides in this repository
- 🐛 Issues: Create an issue on GitHub

## 📄 License

This project is ready for commercial deployment on Hostinger.

---

**Ready for Production** ✅ | **GDPR Compliant** 🔒 | **AI Powered** 🤖 | **Hostinger Optimized** 🚀
