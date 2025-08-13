import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { kafkaService, KAFKA_TOPICS, EVENT_TYPES } from '../config/kafka';
import { OpenRouterService } from './openrouterService';
import { logger } from '../utils/logger';

interface ConversionRequest {
  conversionId: string;
  inputPath: string;
  outputFormat: string;
  originalFilename: string;
  userId: string;
  aiEnhanced: boolean;
}

export class ConversionService {
  private openRouterService: OpenRouterService;

  constructor() {
    this.openRouterService = new OpenRouterService();
  }

  getSupportedFormats() {
    return this.openRouterService.getSupportedFormats();
  }

  async convertFile(request: ConversionRequest) {
    try {
      logger.info(`Starting AI conversion for ${request.originalFilename} to ${request.outputFormat}`);
      
      // Update status to processing
      await db.query(
        'UPDATE conversions SET status = $1, conversion_started_at = NOW() WHERE id = $2',
        ['processing', request.conversionId]
      );

      // Publish conversion started event
      await kafkaService.publishEvent(KAFKA_TOPICS.FILE_CONVERSION_EVENTS, {
        type: EVENT_TYPES.CONVERSION_STARTED,
        conversionId: request.conversionId,
        userId: request.userId,
        outputFormat: request.outputFormat
      });
      // Check if conversion is supported
      const sourceFormat = path.extname(request.originalFilename).slice(1).toLowerCase();
      if (!this.openRouterService.isConversionSupported(sourceFormat, request.outputFormat)) {
        throw new Error(`Conversion from ${sourceFormat} to ${request.outputFormat} is not supported`);
      }

      // Perform AI-powered conversion
      const startTime = Date.now();
      const result = await this.openRouterService.convertFile({
        conversionId: request.conversionId,
        inputPath: request.inputPath,
        outputFormat: request.outputFormat,
        originalFilename: request.originalFilename,
        userId: request.userId,
        aiEnhanced: request.aiEnhanced
      });

      if (!result.success) {
        throw new Error(result.error || 'AI conversion failed');
      }

      if (!result.outputPath) {
        throw new Error('No output path returned from AI conversion');
      }

      const conversionTime = Date.now() - startTime;
      const downloadUrl = `/api/conversion/download/${request.conversionId}`;

      // Move the converted file to a standardized location
      const finalOutputPath = path.join('uploads', `${uuidv4()}.${request.outputFormat}`);
      await fs.copyFile(result.outputPath, finalOutputPath);
      
      // Clean up temporary converted file
      if (fsSync.existsSync(result.outputPath)) {
        await fs.unlink(result.outputPath);
      }

      // Update conversion record with success
      await db.query(`
        UPDATE conversions 
        SET status = $1, converted_filename = $2, download_url = $3, 
            conversion_time = $4, conversion_ended_at = NOW()
        WHERE id = $5
      `, ['completed', path.basename(finalOutputPath), downloadUrl, conversionTime, request.conversionId]);

      // Publish conversion completed event
      await kafkaService.publishEvent(KAFKA_TOPICS.FILE_CONVERSION_EVENTS, {
        type: EVENT_TYPES.CONVERSION_COMPLETED,
        conversionId: request.conversionId,
        userId: request.userId,
        convertedFileName: path.basename(finalOutputPath),
        downloadUrl,
        processingTime: conversionTime
      });
      // Clean up input file
      await fs.unlink(request.inputPath).catch(() => {});

      logger.info(`AI conversion completed successfully: ${request.conversionId} (${conversionTime}ms)`);

    } catch (error) {
      logger.error(`AI conversion failed: ${request.conversionId}`, error);
      
      await db.query(
        'UPDATE conversions SET status = $1, error_message = $2, conversion_ended_at = NOW() WHERE id = $3',
        ['failed', error instanceof Error ? error.message : 'Unknown error', request.conversionId]
      );

      // Publish conversion failed event
      await kafkaService.publishEvent(KAFKA_TOPICS.FILE_CONVERSION_EVENTS, {
        type: EVENT_TYPES.CONVERSION_FAILED,
        conversionId: request.conversionId,
        userId: request.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Clean up input file
      await fs.unlink(request.inputPath).catch(() => {});
    }
  }

  /**
   * Check if a specific conversion is supported
   */
  isConversionSupported(fromFormat: string, toFormat: string): boolean {
    return this.openRouterService.isConversionSupported(fromFormat, toFormat);
  }

  /**
   * Get conversion complexity for pricing/rate limiting
   */
  getConversionComplexity(fromFormat: string, toFormat: string): 'simple' | 'medium' | 'complex' {
    return this.openRouterService.getConversionComplexity(fromFormat, toFormat);
  }

  /**
   * Estimate conversion time based on file size and complexity
   */
  estimateConversionTime(fileSizeBytes: number, complexity: 'simple' | 'medium' | 'complex'): number {
    const baseTimeSeconds = {
      simple: 10,
      medium: 30,
      complex: 60
    };

    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    const sizeMultiplier = Math.max(1, fileSizeMB / 5); // Add 1x time per 5MB for AI processing

    return baseTimeSeconds[complexity] * sizeMultiplier;
  }

  /**
   * Validate file for conversion
   */
  validateFile(filePath: string, targetFormat: string): { valid: boolean; error?: string } {
    try {
      // Check if file exists
      if (!fsSync.existsSync(filePath)) {
        return { valid: false, error: 'File does not exist' };
      }

      // Get file stats
      const stats = fsSync.statSync(filePath);
      
      // Check file size (50MB limit for AI processing)
      const maxSizeBytes = 50 * 1024 * 1024;
      if (stats.size > maxSizeBytes) {
        return { valid: false, error: 'File size exceeds 50MB limit for AI conversion' };
      }

      // Check if file is empty
      if (stats.size === 0) {
        return { valid: false, error: 'File is empty' };
      }

      // Get source format
      const sourceFormat = path.extname(filePath).slice(1).toLowerCase();
      if (!this.isConversionSupported(sourceFormat, targetFormat)) {
        return { valid: false, error: `Conversion from ${sourceFormat} to ${targetFormat} is not supported` };
      }

      return { valid: true };

    } catch (error) {
      logger.error('Error validating file:', error);
      return { valid: false, error: 'Failed to validate file' };
    }
  }
}