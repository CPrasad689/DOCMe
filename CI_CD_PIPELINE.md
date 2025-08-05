# DOCMe CI/CD Pipeline & Deployment Guide

## Overview
This document outlines the complete Continuous Integration and Continuous Deployment (CI/CD) pipeline for the DOCMe application across web, iOS, and Android platforms. The pipeline ensures automated testing, building, and deployment with zero-downtime releases.

## Pipeline Architecture

### Multi-Environment Strategy
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Development │ -> │   Staging   │ -> │   Testing   │ -> │ Production  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     Local             Preview           UAT              Live
```

## GitHub Actions Workflows

### 1. Main CI/CD Pipeline
```yaml
# .github/workflows/main.yml
name: DOCMe CI/CD Pipeline

on:
  push:
    branches: [main, develop, feature/*]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Quality Checks
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npm run type-check

      - name: Run Prettier check
        run: npm run format:check

      - name: Security audit
        run: npm audit --audit-level=high

  # Unit & Integration Tests
  tests:
    runs-on: ubuntu-latest
    needs: quality-checks
    strategy:
      matrix:
        test-type: [unit, integration, e2e]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ${{ matrix.test-type }} tests
        run: npm run test:${{ matrix.test-type }}

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: ${{ matrix.test-type }}

  # Build Web Application
  build-web:
    runs-on: ubuntu-latest
    needs: [quality-checks, tests]
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_STRIPE_PUBLISHABLE_KEY: ${{ secrets.VITE_STRIPE_PUBLISHABLE_KEY }}

      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

      - name: Run container security scan
        uses: anchore/scan-action@v3
        with:
          image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

  # Deploy to Staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build-web
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - name: Deploy to staging
        uses: ./.github/actions/deploy
        with:
          environment: staging
          image-tag: ${{ needs.build-web.outputs.image-tag }}
          kubeconfig: ${{ secrets.KUBECONFIG_STAGING }}

      - name: Run smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: https://staging.docme.app

  # Deploy to Production
  deploy-production:
    runs-on: ubuntu-latest
    needs: [build-web, deploy-staging]
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to production
        uses: ./.github/actions/deploy
        with:
          environment: production
          image-tag: ${{ needs.build-web.outputs.image-tag }}
          kubeconfig: ${{ secrets.KUBECONFIG_PRODUCTION }}

      - name: Run health checks
        run: npm run test:health
        env:
          BASE_URL: https://docme.app

      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 2. Mobile App CI/CD
```yaml
# .github/workflows/mobile.yml
name: Mobile Apps CI/CD

on:
  push:
    branches: [main, mobile/*]
    paths: ['mobile/**']

jobs:
  # iOS Build and Deploy
  ios:
    runs-on: macos-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup React Native
        uses: ./.github/actions/setup-react-native

      - name: Setup iOS
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: '15.0'

      - name: Install dependencies
        run: |
          cd mobile
          npm ci
          cd ios && pod install

      - name: Build iOS app
        run: |
          cd mobile
          npx react-native run-ios --configuration Release

      - name: Run iOS tests
        run: |
          cd mobile
          npm run test:ios

      - name: Build for App Store
        if: github.ref == 'refs/heads/main'
        run: |
          cd mobile/ios
          xcodebuild -workspace DOCMe.xcworkspace \
                     -scheme DOCMe \
                     -configuration Release \
                     -archivePath DOCMe.xcarchive \
                     archive

      - name: Deploy to App Store Connect
        if: github.ref == 'refs/heads/main'
        uses: apple-actions/upload-testflight-build@v1
        with:
          app-path: mobile/ios/DOCMe.xcarchive
          issuer-id: ${{ secrets.APPSTORE_ISSUER_ID }}
          api-key-id: ${{ secrets.APPSTORE_API_KEY_ID }}
          api-private-key: ${{ secrets.APPSTORE_API_PRIVATE_KEY }}

  # Android Build and Deploy
  android:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup React Native
        uses: ./.github/actions/setup-react-native

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Install dependencies
        run: |
          cd mobile
          npm ci

      - name: Build Android app
        run: |
          cd mobile/android
          ./gradlew assembleRelease

      - name: Run Android tests
        run: |
          cd mobile
          npm run test:android

      - name: Sign APK
        if: github.ref == 'refs/heads/main'
        uses: r0adkll/sign-android-release@v1
        with:
          releaseDirectory: mobile/android/app/build/outputs/apk/release
          signingKeyBase64: ${{ secrets.ANDROID_SIGNING_KEY }}
          alias: ${{ secrets.ANDROID_KEY_ALIAS }}
          keyStorePassword: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}

      - name: Deploy to Google Play
        if: github.ref == 'refs/heads/main'
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
          packageName: com.docme.app
          releaseFiles: mobile/android/app/build/outputs/apk/release/app-release-signed.apk
          track: production
```

### 3. Backend API Pipeline
```yaml
# .github/workflows/api.yml
name: Backend API CI/CD

on:
  push:
    branches: [main, develop]
    paths: ['api/**']

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: docme_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: api/package-lock.json

      - name: Install dependencies
        run: |
          cd api
          npm ci

      - name: Run database migrations
        run: |
          cd api
          npm run db:migrate
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/docme_test

      - name: Run tests
        run: |
          cd api
          npm run test:coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/docme_test
          REDIS_URL: redis://localhost:6379

  deploy:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Kubernetes
        uses: ./.github/actions/deploy-api
        with:
          environment: production
          namespace: docme-api
```

## Custom GitHub Actions

### 1. Setup React Native Action
```yaml
# .github/actions/setup-react-native/action.yml
name: 'Setup React Native'
description: 'Setup React Native development environment'

runs:
  using: 'composite'
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Setup Ruby (for iOS)
      uses: ruby/setup-ruby@v1
      with:
        ruby-version: '3.0'
        bundler-cache: true

    - name: Cache Gradle (for Android)
      uses: actions/cache@v3
      with:
        path: |
          ~/.gradle/caches
          ~/.gradle/wrapper
        key: gradle-${{ runner.os }}-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
```

### 2. Deployment Action
```yaml
# .github/actions/deploy/action.yml
name: 'Deploy Application'
description: 'Deploy to Kubernetes cluster'

inputs:
  environment:
    required: true
    description: 'Deployment environment'
  image-tag:
    required: true
    description: 'Docker image tag'
  kubeconfig:
    required: true
    description: 'Kubernetes config'

runs:
  using: 'composite'
  steps:
    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'

    - name: Deploy to Kubernetes
      shell: bash
      run: |
        echo "${{ inputs.kubeconfig }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        
        # Update deployment with new image
        kubectl set image deployment/docme-web \
          docme-web=${{ inputs.image-tag }} \
          --namespace=docme-${{ inputs.environment }}
        
        # Wait for rollout to complete
        kubectl rollout status deployment/docme-web \
          --namespace=docme-${{ inputs.environment }} \
          --timeout=300s
```

## Docker Configuration

### 1. Web Application Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. API Dockerfile
```dockerfile
# api/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
USER node
CMD ["npm", "start"]
```

## Kubernetes Manifests

### 1. Web Application Deployment
```yaml
# k8s/web/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: docme-web
  namespace: docme-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: docme-web
  template:
    metadata:
      labels:
        app: docme-web
    spec:
      containers:
      - name: docme-web
        image: ghcr.io/your-org/docme:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: docme-web-service
  namespace: docme-production
spec:
  selector:
    app: docme-web
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

### 2. API Deployment
```yaml
# k8s/api/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: docme-api
  namespace: docme-production
spec:
  replicas: 5
  selector:
    matchLabels:
      app: docme-api
  template:
    metadata:
      labels:
        app: docme-api
    spec:
      containers:
      - name: docme-api
        image: ghcr.io/your-org/docme-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: docme-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: docme-secrets
              key: redis-url
        resources:
          requests:
            cpu: 200m
            memory: 256Mi
          limits:
            cpu: 1000m
            memory: 1Gi
```

## Monitoring and Alerting

### 1. Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'docme-web'
    static_configs:
      - targets: ['docme-web-service:80']
    metrics_path: /metrics
    scrape_interval: 30s

  - job_name: 'docme-api'
    static_configs:
      - targets: ['docme-api-service:3001']
    metrics_path: /api/metrics
    scrape_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### 2. Alert Rules
```yaml
# monitoring/alert_rules.yml
groups:
  - name: docme.rules
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is above 90%"

      - alert: DatabaseConnectionFailure
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failure"
          description: "Cannot connect to PostgreSQL database"
```

## Database Migrations

### 1. Migration Pipeline
```yaml
# .github/workflows/migrations.yml
name: Database Migrations

on:
  push:
    branches: [main]
    paths: ['api/migrations/**']

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd api
          npm ci

      - name: Run migrations (staging)
        run: |
          cd api
          npm run db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_STAGING }}

      - name: Run migrations (production)
        if: github.ref == 'refs/heads/main'
        run: |
          cd api
          npm run db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_PRODUCTION }}
```

## Security Scanning

### 1. Container Security
```yaml
# .github/workflows/security.yml
name: Security Scans

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  push:
    branches: [main]

jobs:
  container-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t docme:scan .

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'docme:scan'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

## Performance Testing

### 1. Load Testing Pipeline
```yaml
# .github/workflows/performance.yml
name: Performance Testing

on:
  schedule:
    - cron: '0 1 * * 1'  # Weekly on Monday at 1 AM

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install Artillery
        run: npm install -g artillery

      - name: Run load tests
        run: |
          artillery run tests/load/basic-flow.yml \
            --target https://staging.docme.app \
            --output report.json

      - name: Generate HTML report
        run: artillery report report.json

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: |
            report.json
            report.json.html
```

## Rollback Strategy

### 1. Automated Rollback
```bash
#!/bin/bash
# scripts/rollback.sh

NAMESPACE=${1:-docme-production}
DEPLOYMENT=${2:-docme-web}

echo "Rolling back $DEPLOYMENT in $NAMESPACE..."

# Get previous revision
PREVIOUS_REVISION=$(kubectl rollout history deployment/$DEPLOYMENT -n $NAMESPACE --revision=0 | tail -2 | head -1 | awk '{print $1}')

# Rollback to previous revision
kubectl rollout undo deployment/$DEPLOYMENT -n $NAMESPACE --to-revision=$PREVIOUS_REVISION

# Wait for rollback to complete
kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE --timeout=300s

# Verify health
kubectl get pods -n $NAMESPACE -l app=$DEPLOYMENT

echo "Rollback completed successfully!"
```

### 2. Manual Rollback Workflow
```yaml
# .github/workflows/rollback.yml
name: Manual Rollback

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to rollback'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      service:
        description: 'Service to rollback'
        required: true
        default: 'web'
        type: choice
        options:
          - web
          - api
          - worker

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Rollback deployment
        run: |
          echo "${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig
          
          ./scripts/rollback.sh \
            docme-${{ github.event.inputs.environment }} \
            docme-${{ github.event.inputs.service }}

      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#alerts'
          text: |
            🔄 Rollback completed for ${{ github.event.inputs.service }} 
            in ${{ github.event.inputs.environment }} environment
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Cost Optimization

### 1. Resource Management
```yaml
# k8s/hpa.yml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: docme-web-hpa
  namespace: docme-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: docme-web
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 2. Cost Monitoring
```yaml
# .github/workflows/cost-monitoring.yml
name: Cost Monitoring

on:
  schedule:
    - cron: '0 9 * * 1'  # Weekly on Monday at 9 AM

jobs:
  cost-report:
    runs-on: ubuntu-latest
    steps:
      - name: Generate cost report
        run: |
          # Use cloud provider CLI to get cost data
          # Send report to team
          echo "Weekly infrastructure costs: $COST" | \
          curl -X POST -H 'Content-type: application/json' \
          --data "{\"text\":\"💰 Weekly DOCMe infrastructure cost: \$${COST}\"}" \
          ${{ secrets.SLACK_WEBHOOK }}
```

This comprehensive CI/CD pipeline ensures reliable, automated deployment with proper testing, security scanning, monitoring, and rollback capabilities across all platforms.