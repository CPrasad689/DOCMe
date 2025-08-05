/*
  # Initial DOCMe Database Schema

  1. New Tables
    - `users` - User accounts and authentication
    - `subscriptions` - User subscription plans
    - `conversions` - File conversion history
    - `usage_logs` - Usage tracking for billing
    - `api_keys` - API access keys for enterprise users
    - `file_uploads` - Temporary file storage tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Create secure functions for subscription management

  3. Indexes
    - Performance indexes for common queries
    - Composite indexes for analytics
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  plan_type text DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  subscription_status text DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
  stripe_customer_id text UNIQUE,
  api_usage_count integer DEFAULT 0,
  api_usage_reset_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,
  plan_type text NOT NULL CHECK (plan_type IN ('pro', 'enterprise')),
  status text NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- File conversions table
CREATE TABLE IF NOT EXISTS conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  original_filename text NOT NULL,
  converted_filename text,
  source_format text NOT NULL,
  target_format text NOT NULL,
  file_size bigint NOT NULL,
  conversion_time integer, -- in milliseconds
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  download_url text,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  ai_enhanced boolean DEFAULT false,
  batch_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Usage logs for billing and analytics
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL, -- 'conversion', 'api_call', 'download'
  resource_type text, -- 'file_conversion', 'api_endpoint'
  resource_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- API keys for enterprise users
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  key_name text NOT NULL,
  api_key text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  rate_limit integer DEFAULT 1000, -- requests per hour
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- File uploads tracking
CREATE TABLE IF NOT EXISTS file_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text,
  upload_status text DEFAULT 'uploading' CHECK (upload_status IN ('uploading', 'completed', 'failed')),
  expires_at timestamptz DEFAULT (now() + interval '1 hour'),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can read own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for conversions
CREATE POLICY "Users can read own conversions" ON conversions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversions" ON conversions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversions" ON conversions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for usage_logs
CREATE POLICY "Users can read own usage logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage logs" ON usage_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for api_keys
CREATE POLICY "Users can manage own API keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for file_uploads
CREATE POLICY "Users can manage own file uploads" ON file_uploads
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_conversions_user_id ON conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversions_status ON conversions(status);
CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON conversions(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);

-- Functions for subscription management
CREATE OR REPLACE FUNCTION update_user_subscription(
  user_id_param uuid,
  plan_type_param text,
  status_param text
) RETURNS void AS $$
BEGIN
  UPDATE users 
  SET 
    plan_type = plan_type_param,
    subscription_status = status_param,
    updated_at = now()
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired files
CREATE OR REPLACE FUNCTION cleanup_expired_files() RETURNS void AS $$
BEGIN
  -- Mark expired conversions as failed
  UPDATE conversions 
  SET status = 'failed', error_message = 'File expired'
  WHERE expires_at < now() AND status IN ('pending', 'processing');
  
  -- Delete expired file uploads
  DELETE FROM file_uploads 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversions_updated_at BEFORE UPDATE ON conversions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();