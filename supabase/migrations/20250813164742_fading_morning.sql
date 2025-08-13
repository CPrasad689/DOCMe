-- DOCMe Database Schema for PostgreSQL with Kafka Event-Driven Architecture

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  password_hash text NOT NULL,
  first_name text,
  last_name text,
  avatar text,
  email_verified boolean DEFAULT false,
  email_verified_at timestamptz,
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  login_attempts integer DEFAULT 0,
  locked_until timestamptz,
  
  -- GDPR Compliance
  gdpr_consent_at timestamptz,
  marketing_consent boolean DEFAULT false,
  analytics_consent boolean DEFAULT false,
  data_retention_until timestamptz,
  
  -- Subscription & Usage
  subscription_tier text DEFAULT 'FREE' CHECK (subscription_tier IN ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE')),
  subscription_expiry timestamptz,
  monthly_conversions integer DEFAULT 0,
  total_conversions integer DEFAULT 0,
  
  -- Payment Integration
  razorpay_customer_id text UNIQUE,
  stripe_customer_id text UNIQUE,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- File Conversion Tracking
CREATE TABLE IF NOT EXISTS file_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  
  -- File Information
  original_file_name text NOT NULL,
  original_file_size integer NOT NULL,
  original_mime_type text NOT NULL,
  input_format text NOT NULL,
  output_format text NOT NULL,
  
  -- Conversion Process
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED')),
  conversion_started_at timestamptz,
  conversion_ended_at timestamptz,
  processing_time_ms integer,
  
  -- Output File Information
  converted_file_name text,
  converted_file_size integer,
  converted_mime_type text,
  download_url text,
  download_expiry timestamptz,
  download_count integer DEFAULT 0,
  
  -- Security & Compliance
  ip_address text NOT NULL,
  user_agent text,
  request_id text UNIQUE NOT NULL,
  
  -- File Processing Security
  virus_scan_result text, -- 'clean', 'infected', 'suspicious'
  content_validated boolean DEFAULT false,
  
  -- Error Handling
  error_message text,
  error_code text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscription Management
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  
  tier text NOT NULL CHECK (tier IN ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE')),
  status text DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELED', 'EXPIRED', 'SUSPENDED')),
  
  -- Billing
  price_id text,
  customer_id text,
  subscription_id text, -- Stripe/Razorpay subscription ID
  
  -- Dates
  start_date timestamptz DEFAULT now(),
  end_date timestamptz NOT NULL,
  canceled_at timestamptz,
  
  -- Usage Limits
  monthly_conversions integer DEFAULT 0,
  conversion_limit integer NOT NULL,
  max_file_size integer NOT NULL, -- in bytes
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment Tracking
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  
  -- Payment Information
  amount decimal(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELED')),
  
  -- Gateway Information
  payment_gateway text NOT NULL, -- 'stripe', 'razorpay', 'paypal'
  transaction_id text UNIQUE,
  gateway_payment_id text,
  gateway_customer_id text,
  
  -- Payment Details
  payment_method text,
  description text,
  
  -- Timestamps
  paid_at timestamptz,
  failed_at timestamptz,
  refunded_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- GDPR Audit Logging
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  
  -- Action Details
  action text NOT NULL, -- 'login', 'file_upload', 'conversion', 'data_access'
  resource text NOT NULL, -- 'user', 'file', 'conversion', 'subscription'
  resource_id text,
  
  -- Request Information
  ip_address text NOT NULL,
  user_agent text,
  request_id text NOT NULL,
  
  -- GDPR Compliance
  legal_basis text, -- 'consent', 'contract', 'legitimate_interest'
  data_subject_id text,
  processing_purpose text NOT NULL,
  
  -- Additional Data
  metadata jsonb,
  
  created_at timestamptz DEFAULT now()
);

-- GDPR Data Requests
CREATE TABLE IF NOT EXISTS gdpr_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  
  -- Request Information
  email text NOT NULL,
  full_name text NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('ACCESS', 'PORTABILITY', 'RECTIFICATION', 'ERASURE', 'RESTRICTION', 'OBJECTION')),
  request_details text,
  
  -- Verification
  verification_token text,
  verified_at timestamptz,
  
  -- Processing
  status text DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'VERIFIED', 'PROCESSING', 'COMPLETED', 'REJECTED')),
  assigned_to text,
  
  -- Request Context
  ip_address text NOT NULL,
  user_agent text,
  request_id text UNIQUE NOT NULL,
  
  -- Response
  response_data text,
  response_delivered_at timestamptz,
  
  -- Timestamps
  submitted_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  completed_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Consent Management
CREATE TABLE IF NOT EXISTS user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  
  email text NOT NULL, -- For non-registered users
  consent_type text NOT NULL CHECK (consent_type IN ('MARKETING', 'ANALYTICS', 'PREFERENCES', 'COOKIES', 'PROCESSING')),
  
  -- Consent Status
  granted boolean DEFAULT false,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  
  -- Context
  method text NOT NULL, -- 'cookie_banner', 'settings_page', 'email_link'
  ip_address text NOT NULL,
  user_agent text,
  
  -- Additional Information
  purpose text,
  data_categories text,
  retention text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(email, consent_type)
);

-- Security Incidents
CREATE TABLE IF NOT EXISTS security_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Incident Details
  type text NOT NULL, -- 'failed_login', 'suspicious_activity', 'data_breach'
  severity text DEFAULT 'LOW' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  description text NOT NULL,
  
  -- Context
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  ip_address text NOT NULL,
  user_agent text,
  request_id text,
  
  -- Investigation
  status text DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED')),
  assigned_to text,
  resolution text,
  resolved_at timestamptz,
  
  -- Notification
  notified_at timestamptz,
  reported_to_authority boolean DEFAULT false,
  
  -- Additional Data
  metadata jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- File Processing Logs
CREATE TABLE IF NOT EXISTS file_processing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversion_id text,
  
  -- Processing Step
  step text NOT NULL, -- 'upload', 'validation', 'conversion', 'download'
  status text NOT NULL, -- 'started', 'completed', 'failed'
  
  -- Performance Metrics
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  processing_time_ms integer,
  memory_usage integer, -- in bytes
  cpu_usage float, -- percentage
  
  -- Error Information
  error_message text,
  error_stack text,
  
  -- Additional Context
  metadata jsonb,
  
  created_at timestamptz DEFAULT now()
);

-- System Configuration
CREATE TABLE IF NOT EXISTS system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  category text, -- 'security', 'features', 'limits'
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Sessions (for express-session)
CREATE TABLE IF NOT EXISTS user_sessions (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL,
  PRIMARY KEY (sid)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_file_conversions_user_id ON file_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_file_conversions_status ON file_conversions(status);
CREATE INDEX IF NOT EXISTS idx_file_conversions_created_at ON file_conversions(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_email ON gdpr_requests(email);
CREATE INDEX IF NOT EXISTS idx_user_consents_email ON user_consents(email);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expire ON user_sessions(expire);

-- Functions for automated cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_files()
RETURNS void AS $$
BEGIN
  -- Update status of files that should be deleted
  UPDATE file_conversions 
  SET status = 'EXPIRED'
  WHERE download_expiry < now() 
  AND status IN ('PENDING', 'PROCESSING', 'COMPLETED');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_conversions_updated_at 
  BEFORE UPDATE ON file_conversions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gdpr_requests_updated_at 
  BEFORE UPDATE ON gdpr_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_consents_updated_at 
  BEFORE UPDATE ON user_consents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_incidents_updated_at 
  BEFORE UPDATE ON security_incidents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at 
  BEFORE UPDATE ON system_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();