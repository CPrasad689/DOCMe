# 🚀 DOCMe - AI-Powered Document Conversion Platform

[![Deployment Status](https://img.shields.io/badge/Status-Event%20Driven%20Architecture-green)](https://github.com/CPrasad689/DOCMe)
[![GDPR Compliant](https://img.shields.io/badge/GDPR-Compliant-blue)](./src/components/pages/PrivacyPolicy.tsx)
[![Kafka Powered](https://img.shields.io/badge/Kafka-Event%20Driven-orange)](./api/src/config/kafka.ts)
[![AI Powered](https://img.shields.io/badge/AI-OpenRouter%20Powered-orange)](./api/src/services/openrouterService.ts)

> **Event-Driven File Conversion Platform** with Kafka messaging, GDPR compliance, and enterprise-grade features. Scalable microservices architecture.

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
- **Event-Driven Architecture** with Apache Kafka
- **PostgreSQL Database** with Prisma ORM
- **Microservices Ready** with event streaming
- **Environment Management** for development/production
- **Scalable Infrastructure** with message queues

## 🏗️ Architecture

```
DOCMe/
├── 🎨 Frontend (React + Vite + TypeScript)
│   ├── src/components/          # UI Components
│   ├── src/pages/              # Page Components  
│   ├── src/hooks/              # Custom React Hooks
│   └── src/config/             # Configuration
│
├── ⚡ Backend API (Express + TypeScript + Kafka)
│   ├── api/src/routes/         # API Endpoints
│   ├── api/src/services/       # Business Logic
│   ├── api/src/middleware/     # Security & Auth
│   ├── api/src/config/         # Kafka & Database Config
│   └── api/src/database/       # Database Schema
│
├── 🗄️ Database (PostgreSQL)
│   ├── User Management
│   ├── Conversion History
│   ├── Payment Records
│   └── Analytics Data
│
├── 📡 Event Streaming (Apache Kafka)
│   ├── User Events
│   ├── File Conversion Events
│   ├── Payment Events
│   └── Audit Events
│
└── 🤖 AI Integration (OpenRouter API)
    ├── Content Enhancement
    ├── Format Optimization
    └── Intelligent Conversion
```

## 🚀 Quick Start with Kafka

### 1. Start Infrastructure Services
```bash
# Start Kafka, PostgreSQL, and Redis
docker-compose -f docker-compose.kafka.yml up -d

# Wait for services to be ready
docker-compose -f docker-compose.kafka.yml logs -f
```

### 2. Environment Setup
Create `.env` files based on the templates:

```bash
# Frontend (.env)
VITE_API_URL=https://yourdomain.com

# Backend (api/.env)
DATABASE_URL=postgresql://docme_user:docme_password@localhost:5432/docme_db
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=docme-api
KAFKA_GROUP_ID=docme-consumers
OPENROUTER_API_KEY=sk-or-v1-your-key
JWT_SECRET=your-jwt-secret
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 3. Database Setup
```bash
cd api
npm install

# Run database schema
psql -h localhost -U docme_user -d docme_db -f src/database/schema.sql
```

### 4. Start Application
```bash
# Frontend build
npm install
npm run dev

# Backend setup
cd api
npm install
npm run dev
```

### 5. Monitor Kafka Events
```bash
# Access Kafka UI
open http://localhost:8080

# View topics and messages in real-time
```

## 📋 Deployment Checklist

- [x] ✅ **Repository Created** - GitHub repository ready
- [ ] ⚙️ **Environment Variables** - Configure all required env vars
- [ ] 🗄️ **Database Setup** - PostgreSQL database configured
- [ ] 📡 **Kafka Setup** - Apache Kafka cluster running
- [ ] 🔑 **API Keys** - OpenRouter, Stripe/Razorpay keys added
- [ ] 🌐 **Domain Configuration** - Point domain to hosting provider
- [ ] 🔒 **SSL Certificate** - Enable HTTPS
- [ ] 📊 **Analytics Setup** - Configure tracking (optional)
- [ ] 🧪 **Testing** - Verify all features work in production

## 🛠️ Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Apache Kafka 2.8+
- Docker & Docker Compose
- Git

### Local Development
```bash
# Clone repository
git clone https://github.com/CPrasad689/DOCMe.git
cd DOCMe

# Start infrastructure services
docker-compose -f docker-compose.kafka.yml up -d

# Install dependencies
npm install
cd api && npm install && cd ..

# Set up environment
cp .env.example .env
cp api/.env.kafka api/.env

# Initialize database
cd api && npm run db:init
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

### Event-Driven Architecture
- **Apache Kafka**: Real-time event streaming
- **Microservices Ready**: Decoupled service communication
- **Scalable Processing**: Asynchronous file conversion
- **Audit Trail**: Complete event logging for compliance
### Security Implementation
- **GDPR Compliance**: Full data protection compliance
- **Encryption**: AES-256 + TLS 1.3
- **Authentication**: JWT-based with session management
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
- `api/src/database/schema.sql` - Database schema
- `api/src/config/kafka.ts` - Kafka configuration
- `docker-compose.kafka.yml` - Infrastructure services
- `tailwind.config.js` - UI styling configuration

### Event-Driven Architecture Files
- `api/src/config/kafka.ts` - Kafka service configuration
- `api/src/services/eventHandlers.ts` - Event processing logic
- `PRODUCTION_DEPLOYMENT.md` - Production setup guide

## 📚 Documentation

- 📖 [Hostinger Migration Guide](./HOSTINGER_MIGRATION_GUIDE.md)
- 🚀 [Production Deployment](./PRODUCTION_DEPLOYMENT.md)
- 🔒 [GDPR Compliance](./GDPR_DEPLOYMENT_COMPLETE.md)
- 📡 [Kafka Integration](./api/src/config/kafka.ts)
- ✅ [Testing Guide](./COMPLETE_TESTING_GUIDE.md)

## 🤝 Support

For deployment assistance or technical support:
- 📧 Email: support@docme-in.com
- 📖 Documentation: Check the guides in this repository
- 🐛 Issues: Create an issue on GitHub

## 📄 License

This project is ready for commercial deployment on Hostinger.

---

**Event-Driven** 📡 | **GDPR Compliant** 🔒 | **AI Powered** 🤖 | **Kafka Powered** 🚀
