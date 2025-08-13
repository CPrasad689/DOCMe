-- GDPR and Security Compliance Database Schema
-- Add this to your Supabase migration

-- Audit logs table for GDPR compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource text NOT NULL,
  ip_address text NOT NULL,
  user_agent text,
  request_id text NOT NULL,
  legal_basis text,
  data_subject_id uuid,
  processing_purpose text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- GDPR data requests table
CREATE TABLE IF NOT EXISTS gdpr_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('access', 'portability', 'rectification', 'erasure', 'restriction', 'objection')),
  request_details text,
  verification_data text,
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'verified', 'processing', 'completed', 'rejected')),
  submitted_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  completed_at timestamptz,
  ip_address text,
  user_agent text,
  request_id text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Consent management table
CREATE TABLE IF NOT EXISTS user_consent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  email text NOT NULL,
  consent_type text NOT NULL CHECK (consent_type IN ('marketing', 'analytics', 'preferences', 'cookies')),
  granted boolean NOT NULL DEFAULT false,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  method text NOT NULL, -- 'cookie_banner', 'settings_page', 'email_link', etc.
  ip_address text,
  user_agent text,
  legal_basis text,
  version text DEFAULT '1.0',
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure only one active consent per user per type
  UNIQUE(user_id, consent_type, granted_at)
);

-- Data retention policies table
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type text NOT NULL UNIQUE,
  retention_period_days integer NOT NULL,
  legal_basis text NOT NULL,
  description text,
  auto_delete boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Data processing activities (GDPR Article 30 Record)
CREATE TABLE IF NOT EXISTS processing_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  purpose text NOT NULL,
  legal_basis text NOT NULL,
  data_categories text[] NOT NULL,
  data_subjects text[] NOT NULL,
  recipients text[],
  retention_period text,
  security_measures text[],
  transfers_outside_eu boolean DEFAULT false,
  transfer_safeguards text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Security incidents table
CREATE TABLE IF NOT EXISTS security_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  affected_users integer DEFAULT 0,
  data_types text[],
  containment_actions text[],
  notification_required boolean DEFAULT false,
  notification_sent boolean DEFAULT false,
  notification_sent_at timestamptz,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  ip_address text,
  user_agent text,
  request_id text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- File processing logs (temporary files)
CREATE TABLE IF NOT EXISTS file_processing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  filename text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  file_hash text,
  processing_status text DEFAULT 'uploaded' CHECK (processing_status IN ('uploaded', 'processing', 'completed', 'failed', 'deleted')),
  uploaded_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  deleted_at timestamptz,
  ip_address text,
  legal_basis text DEFAULT 'contract',
  retention_until timestamptz, -- When file should be automatically deleted
  created_at timestamptz DEFAULT now()
);

-- User data export requests
CREATE TABLE IF NOT EXISTS data_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  email text NOT NULL,
  export_type text NOT NULL CHECK (export_type IN ('full_export', 'specific_data')),
  data_categories text[],
  status text DEFAULT 'requested' CHECK (status IN ('requested', 'processing', 'ready', 'downloaded', 'expired')),
  download_url text,
  expires_at timestamptz,
  requested_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  downloaded_at timestamptz,
  file_size bigint,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Cookies and tracking preferences
CREATE TABLE IF NOT EXISTS cookie_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL, -- email or session ID for non-logged users
  essential_cookies boolean DEFAULT true,
  analytics_cookies boolean DEFAULT false,
  preferences_cookies boolean DEFAULT false,
  marketing_cookies boolean DEFAULT false,
  consent_date timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  version text DEFAULT '1.0',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Unique constraint per user identifier
  UNIQUE(user_identifier)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id ON audit_logs(request_id);

CREATE INDEX IF NOT EXISTS idx_gdpr_requests_email ON gdpr_requests(email);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_status ON gdpr_requests(status);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_type ON gdpr_requests(request_type);

CREATE INDEX IF NOT EXISTS idx_user_consent_user_id ON user_consent(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consent_email ON user_consent(email);
CREATE INDEX IF NOT EXISTS idx_user_consent_type ON user_consent(consent_type);

CREATE INDEX IF NOT EXISTS idx_file_processing_user_id ON file_processing_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_file_processing_status ON file_processing_logs(processing_status);
CREATE INDEX IF NOT EXISTS idx_file_processing_retention ON file_processing_logs(retention_until);

CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_resolved ON security_incidents(resolved);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookie_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Audit logs - only system and admins can read
CREATE POLICY "System can manage audit logs" ON audit_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'user_role' = 'admin');

-- GDPR requests - users can read their own requests
CREATE POLICY "Users can read own GDPR requests" ON gdpr_requests
  FOR SELECT USING (email = auth.jwt() ->> 'email' OR auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Anyone can submit GDPR requests" ON gdpr_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update GDPR requests" ON gdpr_requests
  FOR UPDATE USING (auth.jwt() ->> 'user_role' = 'admin');

-- User consent - users can manage their own consent
CREATE POLICY "Users can manage own consent" ON user_consent
  FOR ALL USING (auth.uid() = user_id OR email = auth.jwt() ->> 'email');

-- Data retention policies - read only for users, full access for admins
CREATE POLICY "Users can read retention policies" ON data_retention_policies
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage retention policies" ON data_retention_policies
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

-- Processing activities - admins only
CREATE POLICY "Admins can manage processing activities" ON processing_activities
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

-- Security incidents - admins only
CREATE POLICY "Admins can manage security incidents" ON security_incidents
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

-- File processing logs - users can read their own logs
CREATE POLICY "Users can read own file processing logs" ON file_processing_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage file processing logs" ON file_processing_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Data exports - users can manage their own exports
CREATE POLICY "Users can manage own data exports" ON data_exports
  FOR ALL USING (auth.uid() = user_id OR email = auth.jwt() ->> 'email');

-- Cookie preferences - users can manage their own preferences
CREATE POLICY "Users can manage cookie preferences" ON cookie_preferences
  FOR ALL USING (user_identifier = auth.jwt() ->> 'email' OR user_identifier = auth.jwt() ->> 'session_id');

-- Insert default data retention policies
INSERT INTO data_retention_policies (data_type, retention_period_days, legal_basis, description) VALUES
  ('uploaded_files', 1, 'contract', 'Files uploaded for conversion - deleted within 24 hours'),
  ('user_accounts', 2555, 'contract', 'User account data - 7 years for tax purposes'),
  ('payment_records', 2555, 'legal_obligation', 'Payment and billing records - 7 years legal requirement'),
  ('usage_logs', 730, 'legitimate_interest', 'Usage analytics and performance logs - 2 years'),
  ('support_communications', 1095, 'legitimate_interest', 'Customer support communications - 3 years'),
  ('marketing_consent', -1, 'consent', 'Marketing consent records - until withdrawn'),
  ('audit_logs', 2555, 'legal_obligation', 'Security and compliance audit logs - 7 years'),
  ('security_incidents', 2555, 'legal_obligation', 'Security incident records - 7 years');

-- Insert processing activities (GDPR Article 30)
INSERT INTO processing_activities (name, purpose, legal_basis, data_categories, data_subjects, recipients, retention_period, security_measures, transfers_outside_eu, transfer_safeguards) VALUES
  (
    'File Conversion Service',
    'Provide file format conversion services to users',
    'contract',
    ARRAY['identity_data', 'technical_data', 'file_content'],
    ARRAY['customers', 'website_visitors'],
    ARRAY['cloud_storage_providers', 'payment_processors'],
    'Files: 24 hours, User data: 7 years',
    ARRAY['encryption', 'access_controls', 'secure_deletion'],
    true,
    'Standard Contractual Clauses, Adequacy Decisions'
  ),
  (
    'User Authentication',
    'Authenticate users and manage accounts',
    'contract',
    ARRAY['identity_data', 'authentication_data'],
    ARRAY['customers'],
    ARRAY['authentication_providers'],
    '7 years after account closure',
    ARRAY['password_hashing', 'session_management', 'MFA'],
    false,
    null
  ),
  (
    'Payment Processing',
    'Process subscription payments and billing',
    'contract',
    ARRAY['identity_data', 'financial_data'],
    ARRAY['customers'],
    ARRAY['stripe', 'razorpay', 'banks'],
    '7 years for tax compliance',
    ARRAY['PCI_DSS_compliance', 'tokenization'],
    true,
    'Stripe and Razorpay compliance frameworks'
  ),
  (
    'Marketing Communications',
    'Send promotional emails and product updates',
    'consent',
    ARRAY['identity_data', 'communication_preferences'],
    ARRAY['subscribers'],
    ARRAY['email_service_providers'],
    'Until consent withdrawn',
    ARRAY['encryption', 'access_controls', 'unsubscribe_mechanisms'],
    false,
    null
  ),
  (
    'Analytics and Performance',
    'Analyze usage patterns and improve services',
    'legitimate_interest',
    ARRAY['technical_data', 'usage_data'],
    ARRAY['website_visitors', 'customers'],
    ARRAY['analytics_providers'],
    '2 years',
    ARRAY['data_anonymization', 'aggregation', 'access_controls'],
    true,
    'Privacy-compliant analytics with data minimization'
  );

-- Create functions for automated data retention

-- Function to clean up expired files
CREATE OR REPLACE FUNCTION cleanup_expired_files()
RETURNS void AS $$
BEGIN
  -- Update status of files that should be deleted
  UPDATE file_processing_logs 
  SET processing_status = 'deleted', deleted_at = now()
  WHERE retention_until < now() 
  AND processing_status != 'deleted';
  
  -- Log the cleanup action
  INSERT INTO audit_logs (action, resource, ip_address, user_agent, request_id, legal_basis, processing_purpose, metadata)
  VALUES ('automated_file_cleanup', 'file_retention', 'system', 'system', gen_random_uuid()::text, 'legal_obligation', 'data_retention', 
    json_build_object('cleaned_files', (SELECT count(*) FROM file_processing_logs WHERE deleted_at = now())));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old data exports
CREATE OR REPLACE FUNCTION cleanup_expired_exports()
RETURNS void AS $$
BEGIN
  UPDATE data_exports 
  SET status = 'expired'
  WHERE expires_at < now() 
  AND status IN ('ready', 'downloaded');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables with updated_at columns
CREATE TRIGGER update_gdpr_requests_updated_at 
  BEFORE UPDATE ON gdpr_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_consent_updated_at 
  BEFORE UPDATE ON user_consent 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_retention_policies_updated_at 
  BEFORE UPDATE ON data_retention_policies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processing_activities_updated_at 
  BEFORE UPDATE ON processing_activities 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_incidents_updated_at 
  BEFORE UPDATE ON security_incidents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cookie_preferences_updated_at 
  BEFORE UPDATE ON cookie_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
