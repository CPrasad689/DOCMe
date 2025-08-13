import { EachMessagePayload } from 'kafkajs';
import { db } from '../config/database';
import { logger } from '../utils/logger';

export class EventHandlers {
  // Handle user events
  static async handleUserEvents(payload: EachMessagePayload): Promise<void> {
    const message = JSON.parse(payload.message.value?.toString() || '{}');
    
    switch (message.type) {
      case 'user.registered':
        await EventHandlers.handleUserRegistered(message);
        break;
      case 'user.login':
        await EventHandlers.handleUserLogin(message);
        break;
      case 'user.logout':
        await EventHandlers.handleUserLogout(message);
        break;
      default:
        logger.warn('Unknown user event type:', message.type);
    }
  }

  // Handle file conversion events
  static async handleFileConversionEvents(payload: EachMessagePayload): Promise<void> {
    const message = JSON.parse(payload.message.value?.toString() || '{}');
    
    switch (message.type) {
      case 'file.uploaded':
        await EventHandlers.handleFileUploaded(message);
        break;
      case 'conversion.started':
        await EventHandlers.handleConversionStarted(message);
        break;
      case 'conversion.completed':
        await EventHandlers.handleConversionCompleted(message);
        break;
      case 'conversion.failed':
        await EventHandlers.handleConversionFailed(message);
        break;
      default:
        logger.warn('Unknown conversion event type:', message.type);
    }
  }

  // Handle payment events
  static async handlePaymentEvents(payload: EachMessagePayload): Promise<void> {
    const message = JSON.parse(payload.message.value?.toString() || '{}');
    
    switch (message.type) {
      case 'payment.initiated':
        await EventHandlers.handlePaymentInitiated(message);
        break;
      case 'payment.completed':
        await EventHandlers.handlePaymentCompleted(message);
        break;
      case 'payment.failed':
        await EventHandlers.handlePaymentFailed(message);
        break;
      case 'subscription.created':
        await EventHandlers.handleSubscriptionCreated(message);
        break;
      case 'subscription.updated':
        await EventHandlers.handleSubscriptionUpdated(message);
        break;
      case 'subscription.cancelled':
        await EventHandlers.handleSubscriptionCancelled(message);
        break;
      default:
        logger.warn('Unknown payment event type:', message.type);
    }
  }

  // Handle audit events
  static async handleAuditEvents(payload: EachMessagePayload): Promise<void> {
    const message = JSON.parse(payload.message.value?.toString() || '{}');
    
    // Store audit log in database
    await db.query(`
      INSERT INTO audit_logs (user_id, action, resource, ip_address, user_agent, request_id, legal_basis, processing_purpose, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      message.userId || null,
      message.action || message.type,
      message.resource || 'system',
      message.ipAddress || 'system',
      message.userAgent || 'system',
      message.requestId || message.eventId,
      message.legalBasis || 'legitimate_interest',
      message.processingPurpose || 'audit_logging',
      JSON.stringify(message.metadata || {})
    ]);
  }

  // Event handler implementations
  private static async handleUserRegistered(message: any): Promise<void> {
    logger.info('User registered:', message.userId);
    
    // Store audit log
    await db.query(`
      INSERT INTO audit_logs (user_id, action, resource, ip_address, user_agent, request_id, legal_basis, processing_purpose)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      message.userId,
      'user_registration',
      'user',
      'system',
      'system',
      `reg_${Date.now()}`,
      'contract',
      'account_creation'
    ]);
  }

  private static async handleUserLogin(message: any): Promise<void> {
    logger.info('User logged in:', message.userId);
    
    // Update last login timestamp
    await db.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [message.userId]
    );
  }

  private static async handleUserLogout(message: any): Promise<void> {
    logger.info('User logged out:', message.userId);
  }

  private static async handleFileUploaded(message: any): Promise<void> {
    logger.info('File uploaded:', message.fileName);
    
    // Track file upload
    await db.query(`
      INSERT INTO file_processing_logs (user_id, filename, file_size, file_type, processing_status, ip_address, legal_basis, retention_until)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      message.userId,
      message.fileName,
      message.fileSize,
      message.fileType,
      'uploaded',
      message.ipAddress || 'system',
      'contract',
      new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours retention
    ]);
  }

  private static async handleConversionStarted(message: any): Promise<void> {
    logger.info('Conversion started:', message.conversionId);
    
    // Update conversion status
    await db.query(
      'UPDATE conversions SET status = $1, conversion_started_at = NOW() WHERE id = $2',
      ['processing', message.conversionId]
    );
  }

  private static async handleConversionCompleted(message: any): Promise<void> {
    logger.info('Conversion completed:', message.conversionId);
    
    // Update conversion record
    await db.query(`
      UPDATE conversions 
      SET status = $1, conversion_ended_at = NOW(), converted_filename = $2, 
          download_url = $3, processing_time_ms = $4
      WHERE id = $5
    `, [
      'completed',
      message.convertedFileName,
      message.downloadUrl,
      message.processingTime,
      message.conversionId
    ]);

    // Update user conversion count
    if (message.userId) {
      await db.query(
        'UPDATE users SET total_conversions = total_conversions + 1, monthly_conversions = monthly_conversions + 1 WHERE id = $1',
        [message.userId]
      );
    }
  }

  private static async handleConversionFailed(message: any): Promise<void> {
    logger.error('Conversion failed:', message.conversionId, message.error);
    
    // Update conversion record
    await db.query(
      'UPDATE conversions SET status = $1, error_message = $2, conversion_ended_at = NOW() WHERE id = $3',
      ['failed', message.error, message.conversionId]
    );
  }

  private static async handlePaymentInitiated(message: any): Promise<void> {
    logger.info('Payment initiated:', message.paymentId);
  }

  private static async handlePaymentCompleted(message: any): Promise<void> {
    logger.info('Payment completed:', message.paymentId);
    
    // Update user subscription
    if (message.userId && message.planType) {
      await db.query(
        'UPDATE users SET plan_type = $1, subscription_status = $2 WHERE id = $3',
        [message.planType, 'active', message.userId]
      );
    }
  }

  private static async handlePaymentFailed(message: any): Promise<void> {
    logger.error('Payment failed:', message.paymentId, message.error);
  }

  private static async handleSubscriptionCreated(message: any): Promise<void> {
    logger.info('Subscription created:', message.subscriptionId);
  }

  private static async handleSubscriptionUpdated(message: any): Promise<void> {
    logger.info('Subscription updated:', message.subscriptionId);
  }

  private static async handleSubscriptionCancelled(message: any): Promise<void> {
    logger.info('Subscription cancelled:', message.subscriptionId);
    
    // Update user plan to free
    if (message.userId) {
      await db.query(
        'UPDATE users SET plan_type = $1, subscription_status = $2 WHERE id = $3',
        ['free', 'cancelled', message.userId]
      );
    }
  }
}