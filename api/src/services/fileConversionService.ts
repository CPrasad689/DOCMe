import { db } from '../config/database';
import { kafkaService, KAFKA_TOPICS, EVENT_TYPES } from '../config/kafka';
import { v4 as uuidv4 } from 'uuid';

type ConversionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

export interface FileConversionData {
  userId?: string;
  originalFileName: string;
  originalFileSize: number;
  originalMimeType: string;
  inputFormat: string;
  outputFormat: string;
  ipAddress: string;
  userAgent?: string;
  requestId: string;
}

export interface ConversionResult {
  success: boolean;
  convertedFileName?: string;
  convertedFileSize?: number;
  convertedMimeType?: string;
  downloadUrl?: string;
  processingTimeMs?: number;
  errorMessage?: string;
  errorCode?: string;
}

export class FileConversionService {
  // Create a new file conversion record
  static async createConversion(data: FileConversionData) {
    const conversionId = uuidv4();
    const requestId = data.requestId || `conv_${uuidv4()}`;
    const downloadExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.query(`
      INSERT INTO file_conversions (
        id, user_id, original_file_name, original_file_size, original_mime_type,
        input_format, output_format, status, ip_address, user_agent, request_id, download_expiry
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      conversionId,
      data.userId,
      data.originalFileName,
      data.originalFileSize,
      data.originalMimeType,
      data.inputFormat,
      data.outputFormat,
      'PENDING',
      data.ipAddress,
      data.userAgent,
      requestId,
      downloadExpiry
    ]);

    // Publish file upload event
    await kafkaService.publishEvent(KAFKA_TOPICS.AUDIT_EVENTS, {
      type: 'file_upload',
      userId: data.userId,
      conversionId,
      fileName: data.originalFileName,
      fileSize: data.originalFileSize,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      requestId,
      legalBasis: 'contract',
      processingPurpose: 'file_conversion_service'
    });

    return {
      id: conversionId,
      userId: data.userId,
      originalFileName: data.originalFileName,
      status: 'PENDING',
      requestId,
      downloadExpiry,
      createdAt: new Date()
    };
  }

  // Update conversion status
  static async updateConversionStatus(
    conversionId: string, 
    status: ConversionStatus,
    result?: ConversionResult
  ) {
    let query = 'UPDATE file_conversions SET status = $1, updated_at = NOW()';
    let params = [status];

    if (status === 'PROCESSING') {
      query += ', conversion_started_at = NOW()';
    } else if (status === 'COMPLETED' || status === 'FAILED') {
      query += ', conversion_ended_at = NOW()';
      
      if (result) {
        if (result.success) {
          query += ', converted_file_name = $2, converted_file_size = $3, converted_mime_type = $4, download_url = $5, processing_time_ms = $6, content_validated = true';
          params.push(
            result.convertedFileName,
            result.convertedFileSize,
            result.convertedMimeType,
            result.downloadUrl,
            result.processingTimeMs
          );
        } else {
          query += ', error_message = $2, error_code = $3';
          params.push(result.errorMessage, result.errorCode);
        }
      }
    }

    query += ' WHERE id = $' + (params.length + 1);
    params.push(conversionId);

    const conversionResult = await db.query(query, params);
    
    // Get the updated conversion
    const updatedConversionResult = await db.query(
      'SELECT * FROM file_conversions WHERE id = $1',
      [conversionId]
    );
    
    const conversion = updatedConversionResult.rows[0];

    // Update user's conversion count if successful
    if (status === 'COMPLETED' && conversion.user_id) {
      await db.query(
        'UPDATE users SET total_conversions = total_conversions + 1, monthly_conversions = monthly_conversions + 1 WHERE id = $1',
        [conversion.user_id]
      );
    }

    // Publish conversion status event
    await kafkaService.publishEvent(KAFKA_TOPICS.AUDIT_EVENTS, {
      type: `conversion_${status.toLowerCase()}`,
      userId: conversion.user_id,
      conversionId: conversion.id,
      ipAddress: conversion.ip_address,
      userAgent: conversion.user_agent,
      requestId: conversion.request_id,
      legalBasis: 'contract',
      processingPurpose: 'file_conversion_service',
      metadata: result ? {
        processingTimeMs: result.processingTimeMs,
        success: result.success,
        errorCode: result.errorCode
      } : null
    });

    return conversion;
  }

  // Get conversion by ID
  static async getConversionById(conversionId: string, userId?: string) {
    let query = 'SELECT * FROM file_conversions WHERE id = $1';
    let params = [conversionId];

    if (userId) {
      query += ' AND (user_id = $2 OR user_id IS NULL)';
      params.push(userId);
    }

    const result = await db.query(query, params);
    return result.rows[0] || null;
  }

  // Get user's conversion history
  static async getUserConversions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const conversionsResult = await db.query(`
      SELECT id, original_file_name, original_file_size, input_format, output_format,
             status, converted_file_name, converted_file_size, download_url,
             download_expiry, download_count, processing_time_ms, error_message,
             created_at, conversion_ended_at
      FROM file_conversions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [userId, limit, skip]);

    const countResult = await db.query(
      'SELECT COUNT(*) FROM file_conversions WHERE user_id = $1',
      [userId]
    );

    const conversions = conversionsResult.rows;
    const total = parseInt(countResult.rows[0].count);

    return {
      conversions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Track file download
  static async trackDownload(conversionId: string, ipAddress: string, userAgent?: string) {
    const conversionResult = await db.query(
      'SELECT * FROM file_conversions WHERE id = $1',
      [conversionId]
    );

    if (conversionResult.rows.length === 0 || !conversionResult.rows[0].download_url) {
      throw new Error('Conversion not found or no download available');
    }

    const conversion = conversionResult.rows[0];

    // Check if download has expired
    if (conversion.download_expiry && new Date(conversion.download_expiry) < new Date()) {
      throw new Error('Download has expired');
    }

    // Update download count
    await db.query(
      'UPDATE file_conversions SET download_count = download_count + 1 WHERE id = $1',
      [conversionId]
    );

    // Publish download event
    await kafkaService.publishEvent(KAFKA_TOPICS.AUDIT_EVENTS, {
      type: 'file_download',
      userId: conversion.user_id,
      conversionId,
      ipAddress,
      userAgent: userAgent || 'unknown',
      requestId: `download_${Date.now()}`,
      legalBasis: 'contract',
      processingPurpose: 'file_delivery'
    });

    return conversion;
  }

  // Clean up expired conversions
  static async cleanupExpiredConversions() {
    const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    const expiredConversionsResult = await db.query(`
      SELECT id FROM file_conversions 
      WHERE (download_expiry < $1) OR (status = 'FAILED' AND created_at < $1)
    `, [expiredDate]);

    const expiredConversions = expiredConversionsResult.rows;

    if (expiredConversions.length > 0) {
      // Publish cleanup event
      await kafkaService.publishEvent(KAFKA_TOPICS.AUDIT_EVENTS, {
        type: 'system_cleanup',
        resource: 'file_conversion',
        ipAddress: 'system',
        userAgent: 'system',
        requestId: `cleanup_${Date.now()}`,
        legalBasis: 'legitimate_interest',
        processingPurpose: 'data_retention_compliance',
        metadata: {
          cleanedCount: expiredConversions.length,
          type: 'expired_conversions'
        }
      });

      // Delete expired conversions
      const conversionIds = expiredConversions.map(c => c.id);
      await db.query(
        `DELETE FROM file_conversions WHERE id = ANY($1)`,
        [conversionIds]
      );
    }

    return expiredConversions.length;
  }

  // Get conversion statistics
  static async getConversionStats(userId?: string) {
    let whereClause = '';
    let params: any[] = [];

    if (userId) {
      whereClause = 'WHERE user_id = $1';
      params = [userId];
    }

    const [
      totalResult,
      successfulResult,
      failedResult,
      todayResult,
      monthResult
    ] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM file_conversions ${whereClause}`, params),
      db.query(`SELECT COUNT(*) FROM file_conversions ${whereClause} ${whereClause ? 'AND' : 'WHERE'} status = 'COMPLETED'`, 
        whereClause ? [...params, 'COMPLETED'] : ['COMPLETED']),
      db.query(`SELECT COUNT(*) FROM file_conversions ${whereClause} ${whereClause ? 'AND' : 'WHERE'} status = 'FAILED'`, 
        whereClause ? [...params, 'FAILED'] : ['FAILED']),
      db.query(`SELECT COUNT(*) FROM file_conversions ${whereClause} ${whereClause ? 'AND' : 'WHERE'} created_at >= CURRENT_DATE`, 
        params),
      db.query(`SELECT COUNT(*) FROM file_conversions ${whereClause} ${whereClause ? 'AND' : 'WHERE'} created_at >= date_trunc('month', CURRENT_DATE)`, 
        params)
    ]);

    const totalConversions = parseInt(totalResult.rows[0].count);
    const successfulConversions = parseInt(successfulResult.rows[0].count);
    const failedConversions = parseInt(failedResult.rows[0].count);
    const todayConversions = parseInt(todayResult.rows[0].count);
    const thisMonthConversions = parseInt(monthResult.rows[0].count);

    const successRate = totalConversions > 0 
      ? (successfulConversions / totalConversions) * 100 
      : 0;

    return {
      totalConversions,
      successfulConversions,
      failedConversions,
      todayConversions,
      thisMonthConversions,
      successRate: Math.round(successRate * 100) / 100
    };
  }
}