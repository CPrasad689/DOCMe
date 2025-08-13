import { Request, Response, NextFunction } from 'express';
import { createHash, randomBytes } from 'crypto';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

// GDPR and Security Compliance Middleware
export interface AuditLogEntry {
  id?: string;
  user_id?: string;
  action: string;
  resource: string;
  ip_address: string;
  user_agent?: string;
  request_id: string;
  legal_basis?: string;
  data_subject_id?: string;
  processing_purpose: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SecurityContext {
  request_id: string;
  ip_address: string;
  user_agent: string;
  user_id?: string;
  session_id?: string;
  risk_score: number;
}

// Generate unique request ID
export const generateRequestId = (): string => {
  return randomBytes(16).toString('hex');
};

// Calculate risk score based on various factors
export const calculateRiskScore = (req: Request): number => {
  let score = 0;
  
  // Check for suspicious patterns
  const userAgent = req.get('User-Agent') || '';
  const xForwardedFor = req.get('X-Forwarded-For');
  const xRealIp = req.get('X-Real-IP');
  
  // Bot detection
  if (/bot|crawler|spider|scraper/i.test(userAgent)) {
    score += 3;
  }
  
  // Missing or suspicious user agent
  if (!userAgent || userAgent.length < 10) {
    score += 2;
  }
  
  // Multiple proxy headers (potential proxy chain)
  if (xForwardedFor && xRealIp) {
    score += 1;
  }
  
  // Unusual request patterns
  const path = req.path;
  if (path.includes('..') || path.includes('//')) {
    score += 5;
  }
  
  return Math.min(score, 10); // Cap at 10
};

// Enhanced request context middleware
export const securityContext = (req: Request, res: Response, next: NextFunction) => {
  const requestId = generateRequestId();
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const riskScore = calculateRiskScore(req);
  
  // Add security context to request
  (req as any).security = {
    request_id: requestId,
    ip_address: ipAddress,
    user_agent: userAgent,
    user_id: (req as any).user?.id,
    session_id: req.session?.id,
    risk_score: riskScore
  } as SecurityContext;
  
  // Add request ID to response headers for tracking
  res.set('X-Request-ID', requestId);
  
  // Log high-risk requests
  if (riskScore >= 7) {
    logger.warn('High-risk request detected', {
      request_id: requestId,
      ip_address: ipAddress,
      user_agent: userAgent,
      risk_score: riskScore,
      path: req.path,
      method: req.method
    });
  }
  
  next();
};

// GDPR Audit Logging
export const auditLog = async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
  try {
    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date()
    };
    
    // Store in database
    const { error } = await supabase
      .from('audit_logs')
      .insert([logEntry]);
    
    if (error) {
      logger.error('Failed to store audit log', error);
    }
    
    // Also log to application logs
    logger.info('Audit Log', logEntry);
    
  } catch (error) {
    logger.error('Audit logging error', error);
  }
};

// GDPR-compliant data processing logger
export const logDataProcessing = (
  req: Request,
  action: string,
  resource: string,
  legalBasis: string,
  purpose: string,
  metadata?: Record<string, any>
) => {
  const security = (req as any).security as SecurityContext;
  
  auditLog({
    user_id: security.user_id,
    action,
    resource,
    ip_address: security.ip_address,
    user_agent: security.user_agent,
    request_id: security.request_id,
    legal_basis: legalBasis,
    data_subject_id: security.user_id,
    processing_purpose: purpose,
    metadata
  });
};

// File processing audit
export const logFileProcessing = (req: Request, filename: string, fileSize: number, fileType: string) => {
  logDataProcessing(
    req,
    'file_upload',
    `file:${filename}`,
    'contract', // Legal basis: contract performance
    'file_conversion_service',
    {
      file_size: fileSize,
      file_type: fileType,
      file_hash: createHash('sha256').update(filename + Date.now()).digest('hex').slice(0, 16)
    }
  );
};

// User authentication audit
export const logAuthentication = (req: Request, success: boolean, method: string) => {
  const security = (req as any).security as SecurityContext;
  
  auditLog({
    user_id: security.user_id,
    action: success ? 'login_success' : 'login_failed',
    resource: 'authentication',
    ip_address: security.ip_address,
    user_agent: security.user_agent,
    request_id: security.request_id,
    legal_basis: 'contract',
    processing_purpose: 'user_authentication',
    metadata: {
      auth_method: method,
      risk_score: security.risk_score
    }
  });
};

// Data access audit
export const logDataAccess = (req: Request, dataType: string, recordCount: number) => {
  logDataProcessing(
    req,
    'data_access',
    `data:${dataType}`,
    'contract',
    'service_provision',
    {
      record_count: recordCount,
      data_type: dataType
    }
  );
};

// GDPR rights request audit
export const logGDPRRequest = (
  req: Request, 
  requestType: string, 
  email: string, 
  status: string = 'submitted'
) => {
  logDataProcessing(
    req,
    `gdpr_${requestType}`,
    'gdpr_request',
    'legal_obligation',
    'gdpr_compliance',
    {
      request_type: requestType,
      email_hash: createHash('sha256').update(email).digest('hex'),
      status
    }
  );
};

// Data deletion audit
export const logDataDeletion = (req: Request, dataType: string, recordsDeleted: number) => {
  logDataProcessing(
    req,
    'data_deletion',
    `data:${dataType}`,
    'legal_obligation',
    'gdpr_right_to_erasure',
    {
      records_deleted: recordsDeleted,
      deletion_timestamp: new Date().toISOString()
    }
  );
};

// Security incident logging
export const logSecurityIncident = (
  req: Request,
  incidentType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string
) => {
  const security = (req as any).security as SecurityContext;
  
  auditLog({
    user_id: security.user_id,
    action: 'security_incident',
    resource: 'security',
    ip_address: security.ip_address,
    user_agent: security.user_agent,
    request_id: security.request_id,
    legal_basis: 'legitimate_interest',
    processing_purpose: 'security_protection',
    metadata: {
      incident_type: incidentType,
      severity,
      description,
      risk_score: security.risk_score,
      timestamp: new Date().toISOString()
    }
  });
  
  // Also log to security logs with appropriate level
  const logLevel = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info';
  logger[logLevel](`Security Incident: ${incidentType}`, {
    request_id: security.request_id,
    ip_address: security.ip_address,
    severity,
    description
  });
};

// Data breach notification
export const logDataBreach = (
  affectedUsers: number,
  dataTypes: string[],
  breachType: string,
  containmentActions: string[]
) => {
  const breachId = generateRequestId();
  
  // Log breach details
  logger.error('DATA BREACH DETECTED', {
    breach_id: breachId,
    affected_users: affectedUsers,
    data_types: dataTypes,
    breach_type: breachType,
    containment_actions: containmentActions,
    timestamp: new Date().toISOString()
  });
  
  // Store in audit log
  auditLog({
    action: 'data_breach',
    resource: 'data_protection',
    ip_address: 'system',
    user_agent: 'system',
    request_id: breachId,
    legal_basis: 'legal_obligation',
    processing_purpose: 'breach_notification',
    metadata: {
      breach_id: breachId,
      affected_users: affectedUsers,
      data_types: dataTypes,
      breach_type: breachType,
      containment_actions: containmentActions,
      notification_required: affectedUsers > 0 || dataTypes.includes('personal_data'),
      severity: affectedUsers > 1000 ? 'critical' : affectedUsers > 100 ? 'high' : 'medium'
    }
  });
};

// Consent management audit
export const logConsentChange = (
  req: Request,
  email: string,
  consentType: string,
  granted: boolean,
  method: string
) => {
  logDataProcessing(
    req,
    granted ? 'consent_granted' : 'consent_withdrawn',
    'consent_management',
    'consent',
    'consent_processing',
    {
      email_hash: createHash('sha256').update(email).digest('hex'),
      consent_type: consentType,
      granted,
      method,
      timestamp: new Date().toISOString()
    }
  );
};

// Rate limiting audit
export const logRateLimit = (req: Request, limitType: string, exceeded: boolean) => {
  const security = (req as any).security as SecurityContext;
  
  if (exceeded) {
    logSecurityIncident(
      req,
      'rate_limit_exceeded',
      'medium',
      `Rate limit exceeded for ${limitType}`
    );
  }
  
  auditLog({
    user_id: security.user_id,
    action: exceeded ? 'rate_limit_exceeded' : 'rate_limit_check',
    resource: 'rate_limiting',
    ip_address: security.ip_address,
    user_agent: security.user_agent,
    request_id: security.request_id,
    legal_basis: 'legitimate_interest',
    processing_purpose: 'service_protection',
    metadata: {
      limit_type: limitType,
      exceeded,
      risk_score: security.risk_score
    }
  });
};

// Clean up old audit logs (GDPR retention)
export const cleanupAuditLogs = async (retentionDays: number = 2555) => { // 7 years default
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const { data, error } = await supabase
      .from('audit_logs')
      .delete()
      .lt('timestamp', cutoffDate.toISOString());
    
    if (error) {
      logger.error('Failed to cleanup audit logs', error);
      return;
    }
    
    logger.info(`Cleaned up audit logs older than ${retentionDays} days`, {
      records_deleted: data?.length || 0,
      cutoff_date: cutoffDate.toISOString()
    });
    
  } catch (error) {
    logger.error('Audit log cleanup error', error);
  }
};

// Export all functions
export default {
  securityContext,
  auditLog,
  logDataProcessing,
  logFileProcessing,
  logAuthentication,
  logDataAccess,
  logGDPRRequest,
  logDataDeletion,
  logSecurityIncident,
  logDataBreach,
  logConsentChange,
  logRateLimit,
  cleanupAuditLogs,
  generateRequestId,
  calculateRiskScore
};
