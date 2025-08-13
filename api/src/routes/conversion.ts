import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { validateConversion } from '../middleware/validation';
import { OpenRouterService } from '../services/openrouterService';
import { kafkaService, KAFKA_TOPICS, EVENT_TYPES } from '../config/kafka';
import { db } from '../config/database';
import { logger } from '../utils/logger';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '1073741824'), // 1GB default
  }
});

const openRouterService = new OpenRouterService();

// Get supported formats
router.get('/formats', (req: express.Request, res: express.Response) => {
  try {
    const formats = openRouterService.getSupportedFormats();
    return res.json({ formats });
  } catch (error) {
    logger.error('Error getting supported formats:', error);
    return res.status(500).json({ error: 'Failed to get supported formats' });
  }
});

// Upload and convert file
router.post('/convert', 
  authenticateUser, 
  upload.single('file'), 
  validateConversion,
  async (req: express.Request, res: express.Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const { targetFormat, aiEnhanced = false } = authReq.body;
      const file = authReq.file;
      const userId = authReq.user.id;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Check user's plan limits
      const userResult = await db.query(
        'SELECT plan_type, api_usage_count FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];

      // Check conversion limits based on plan
      const limits: { [key: string]: number } = {
        free: 5,
        pro: -1, // unlimited
        enterprise: -1 // unlimited
      };

      if (limits[user.plan_type] !== -1 && user.api_usage_count >= limits[user.plan_type]) {
        return res.status(429).json({ 
          error: 'Conversion limit exceeded. Please upgrade your plan.' 
        });
      }

      const conversionId = uuidv4();

      // Create conversion record
      await db.query(`
        INSERT INTO conversions (id, user_id, original_filename, source_format, target_format, file_size, status, ai_enhanced)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        conversionId,
        userId,
        file.originalname,
        path.extname(file.originalname).slice(1).toLowerCase(),
        targetFormat.toLowerCase(),
        file.size,
        'pending',
        aiEnhanced
      ]);

      // Publish file upload event
      await kafkaService.publishEvent(KAFKA_TOPICS.FILE_CONVERSION_EVENTS, {
        type: EVENT_TYPES.FILE_UPLOADED,
        userId,
        conversionId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        ipAddress: req.ip || 'unknown'
      });

      // Start conversion process
      openRouterService.convertFile({
        conversionId,
        inputPath: file.path,
        outputFormat: targetFormat,
        originalFilename: file.originalname,
        userId,
        aiEnhanced
      });

      // Publish conversion started event
      await kafkaService.publishEvent(KAFKA_TOPICS.FILE_CONVERSION_EVENTS, {
        type: EVENT_TYPES.CONVERSION_STARTED,
        userId,
        conversionId,
        targetFormat
      });

      // Update usage count
      await db.query(
        'UPDATE users SET api_usage_count = api_usage_count + 1 WHERE id = $1',
        [userId]
      );

      return res.json({
        conversionId,
        status: 'pending',
        message: 'Conversion started successfully'
      });

    } catch (error) {
      logger.error('Error in file conversion:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get conversion status
router.get('/status/:conversionId', authenticateUser, async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const { conversionId } = authReq.params;
    const userId = authReq.user.id;

    const conversionResult = await db.query(
      'SELECT * FROM conversions WHERE id = $1 AND user_id = $2',
      [conversionId, userId]
    );

    if (conversionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversion not found' });
    }

    const conversion = conversionResult.rows[0];

    return res.json({
      id: conversion.id,
      status: conversion.status,
      progress: conversion.status === 'completed' ? 100 : 
                conversion.status === 'processing' ? 50 : 0,
      downloadUrl: conversion.download_url,
      error: conversion.error_message,
      createdAt: conversion.created_at,
      expiresAt: conversion.expires_at
    });

  } catch (error) {
    logger.error('Error getting conversion status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's conversion history
router.get('/history', authenticateUser, async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const userId = authReq.user.id;
    const { page = 1, limit = 20 } = authReq.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conversionsResult = await db.query(`
      SELECT * FROM conversions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [userId, Number(limit), offset]);

    const countResult = await db.query(
      'SELECT COUNT(*) FROM conversions WHERE user_id = $1',
      [userId]
    );

    const conversions = conversionsResult.rows;
    const count = parseInt(countResult.rows[0].count);
    return res.json({
      conversions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / Number(limit))
      }
    });

  } catch (error) {
    logger.error('Error in conversion history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Download converted file
router.get('/download/:conversionId', authenticateUser, async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const { conversionId } = authReq.params;
    const userId = authReq.user.id;

    // Get conversion record
    const conversionResult = await db.query(
      'SELECT * FROM conversions WHERE id = $1 AND user_id = $2',
      [conversionId, userId]
    );

    if (conversionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversion not found' });
    }

    const conversion = conversionResult.rows[0];

    if (conversion.status !== 'completed') {
      return res.status(400).json({ error: 'Conversion not completed yet' });
    }

    if (!conversion.converted_filename) {
      return res.status(404).json({ error: 'Converted file not found' });
    }

    // Check if conversion has expired
    if (conversion.expires_at && new Date(conversion.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Download link has expired' });
    }

    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', conversion.converted_filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Set appropriate headers for download
    const originalName = path.parse(conversion.original_filename).name;
    const downloadFilename = `${originalName}_converted.${conversion.target_format}`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Log the download
    logger.info(`File downloaded: ${conversionId} by user ${userId}`);

  } catch (error) {
    logger.error('Error in file download:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;