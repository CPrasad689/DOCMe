import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { validateConversion } from '../middleware/validation';
import { ConversionService } from '../services/conversionService';
import { logger } from '../utils/logger';
import { supabase } from '../server';

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

const conversionService = new ConversionService();

// Get supported formats
router.get('/formats', (req: express.Request, res: express.Response) => {
  try {
    const formats = conversionService.getSupportedFormats();
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
      const { data: user } = await supabase
        .from('users')
        .select('plan_type, api_usage_count')
        .eq('id', userId)
        .single();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

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

      // Create conversion record
      const { data: conversion, error: conversionError } = await supabase
        .from('conversions')
        .insert({
          user_id: userId,
          original_filename: file.originalname,
          source_format: path.extname(file.originalname).slice(1).toLowerCase(),
          target_format: targetFormat.toLowerCase(),
          file_size: file.size,
          status: 'pending',
          ai_enhanced: aiEnhanced
        })
        .select()
        .single();

      if (conversionError) {
        logger.error('Error creating conversion record:', conversionError);
        return res.status(500).json({ error: 'Failed to create conversion record' });
      }

      // Start conversion process
      conversionService.convertFile({
        conversionId: conversion.id,
        inputPath: file.path,
        outputFormat: targetFormat,
        originalFilename: file.originalname,
        userId,
        aiEnhanced
      });

      // Update usage count
      await supabase
        .from('users')
        .update({ api_usage_count: user.api_usage_count + 1 })
        .eq('id', userId);

      return res.json({
        conversionId: conversion.id,
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

    const { data: conversion, error } = await supabase
      .from('conversions')
      .select('*')
      .eq('id', conversionId)
      .eq('user_id', userId)
      .single();

    if (error || !conversion) {
      return res.status(404).json({ error: 'Conversion not found' });
    }

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

    const { data: conversions, error, count } = await supabase
      .from('conversions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      logger.error('Error getting conversion history:', error);
      return res.status(500).json({ error: 'Failed to get conversion history' });
    }

    return res.json({
      conversions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil((count || 0) / Number(limit))
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
    const { data: conversion, error } = await supabase
      .from('conversions')
      .select('*')
      .eq('id', conversionId)
      .eq('user_id', userId)
      .single();

    if (error || !conversion) {
      return res.status(404).json({ error: 'Conversion not found' });
    }

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