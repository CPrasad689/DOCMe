import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { FileConversionEngine } from '../services/fileConversionEngine.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fsSync.existsSync(uploadDir)) {
      fsSync.mkdirSync(uploadDir, { recursive: true });
    }
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
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for comprehensive conversion support
    cb(null, true);
  }
});

// Initialize conversion engine
const conversionEngine = new FileConversionEngine();

// Mock database for conversions (in production, use PostgreSQL)
const conversions = new Map();

// Get all supported formats
router.get('/formats', (req, res) => {
  try {
    const formats = conversionEngine.getAllSupportedFormats();
    res.json({
      success: true,
      formats,
      totalFormats: Object.values(formats).reduce((sum, category) => sum + category.formats.length, 0)
    });
  } catch (error) {
    console.error('Error getting formats:', error);
    res.status(500).json({ error: 'Failed to get supported formats' });
  }
});

// Check if conversion is supported
router.get('/check/:inputFormat/:outputFormat', (req, res) => {
  try {
    const { inputFormat, outputFormat } = req.params;
    const isSupported = conversionEngine.isConversionSupported(inputFormat, outputFormat);
    
    res.json({
      success: true,
      supported: isSupported,
      inputFormat: inputFormat.toLowerCase(),
      outputFormat: outputFormat.toLowerCase()
    });
  } catch (error) {
    console.error('Error checking conversion support:', error);
    res.status(500).json({ error: 'Failed to check conversion support' });
  }
});

// Upload and convert file
router.post('/convert', upload.single('file'), async (req, res) => {
  try {
    const { targetFormat, aiEnhanced = 'false' } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!targetFormat) {
      return res.status(400).json({ error: 'Target format is required' });
    }

    const conversionId = uuidv4();
    const inputFormat = path.extname(file.originalname).slice(1).toLowerCase();

    // Check if conversion is supported
    if (!conversionEngine.isConversionSupported(inputFormat, targetFormat)) {
      return res.status(400).json({ 
        error: `Conversion from ${inputFormat.toUpperCase()} to ${targetFormat.toUpperCase()} is not supported`,
        supportedFormats: conversionEngine.getAllSupportedFormats()
      });
    }

    // Create conversion record
    conversions.set(conversionId, {
      id: conversionId,
      originalFilename: file.originalname,
      sourceFormat: inputFormat,
      targetFormat: targetFormat.toLowerCase(),
      fileSize: file.size,
      status: 'pending',
      aiEnhanced: aiEnhanced === 'true',
      createdAt: new Date().toISOString(),
      inputPath: file.path
    });

    // Start conversion process asynchronously
    setImmediate(async () => {
      try {
        // Update status to processing
        const conversion = conversions.get(conversionId);
        conversion.status = 'processing';
        conversion.startedAt = new Date().toISOString();
        
        console.log(`Starting conversion: ${inputFormat} → ${targetFormat}`);

        // Perform the actual conversion
        const result = await conversionEngine.convertFile(
          file.path, 
          targetFormat.toLowerCase(),
          {
            aiEnhanced: aiEnhanced === 'true',
            quality: 90,
            compression: 6
          }
        );

        if (result.success) {
          // Move converted file to final location
          const finalPath = path.join('uploads', `${conversionId}.${targetFormat}`);
          await fs.copyFile(result.outputPath, finalPath);
          
          // Clean up temporary files
          if (fsSync.existsSync(result.outputPath) && result.outputPath !== finalPath) {
            await fs.unlink(result.outputPath);
          }
          if (fsSync.existsSync(file.path)) {
            await fs.unlink(file.path);
          }

          // Update conversion record
          conversion.status = 'completed';
          conversion.downloadUrl = `/api/conversion/download/${conversionId}`;
          conversion.convertedFilename = `${conversionId}.${targetFormat}`;
          conversion.convertedFileSize = result.fileSize;
          conversion.completedAt = new Date().toISOString();
          conversion.processingTime = Date.now() - new Date(conversion.startedAt).getTime();

          console.log(`Conversion completed: ${conversionId} (${conversion.processingTime}ms)`);
        } else {
          conversion.status = 'failed';
          conversion.error = result.error || 'Conversion failed';
          conversion.completedAt = new Date().toISOString();
          
          // Clean up input file
          if (fsSync.existsSync(file.path)) {
            await fs.unlink(file.path);
          }

          console.error(`Conversion failed: ${conversionId} - ${conversion.error}`);
        }
      } catch (error) {
        console.error('Conversion process error:', error);
        const conversion = conversions.get(conversionId);
        if (conversion) {
          conversion.status = 'failed';
          conversion.error = error.message;
          conversion.completedAt = new Date().toISOString();
        }
        
        // Clean up input file
        if (fsSync.existsSync(file.path)) {
          await fs.unlink(file.path);
        }
      }
    });

    res.json({
      success: true,
      conversionId,
      status: 'pending',
      message: 'Conversion started successfully',
      supportedConversion: true,
      estimatedTime: '10-30 seconds'
    });

  } catch (error) {
    console.error('Error in file conversion endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversion status
router.get('/status/:conversionId', (req, res) => {
  try {
    const { conversionId } = req.params;
    const conversion = conversions.get(conversionId);

    if (!conversion) {
      return res.status(404).json({ error: 'Conversion not found' });
    }

    const response = {
      id: conversion.id,
      status: conversion.status,
      originalFilename: conversion.originalFilename,
      sourceFormat: conversion.sourceFormat.toUpperCase(),
      targetFormat: conversion.targetFormat.toUpperCase(),
      progress: conversion.status === 'completed' ? 100 : 
                conversion.status === 'processing' ? 50 : 
                conversion.status === 'failed' ? 0 : 10,
      downloadUrl: conversion.downloadUrl,
      error: conversion.error,
      createdAt: conversion.createdAt,
      completedAt: conversion.completedAt,
      processingTime: conversion.processingTime
    };

    res.json({
      success: true,
      conversion: response
    });

  } catch (error) {
    console.error('Error getting conversion status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download converted file
router.get('/download/:conversionId', (req, res) => {
  try {
    const { conversionId } = req.params;
    const conversion = conversions.get(conversionId);

    if (!conversion) {
      return res.status(404).json({ error: 'Conversion not found' });
    }

    if (conversion.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Conversion not completed yet',
        status: conversion.status 
      });
    }

    const filePath = path.join('uploads', conversion.convertedFilename || '');
    
    if (!conversion.convertedFilename || !fsSync.existsSync(filePath)) {
      return res.status(404).json({ error: 'Converted file not found on server' });
    }

    // Generate download filename
    const originalName = path.parse(conversion.originalFilename).name;
    const downloadFilename = `${originalName}_converted.${conversion.targetFormat}`;
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Content-Type', conversionEngine.getMimeType(conversion.targetFormat));
    res.setHeader('Content-Length', conversion.convertedFileSize || 0);

    // Stream the file
    const fileStream = fsSync.createReadStream(filePath);
    fileStream.pipe(res);

    // Log download
    console.log(`File downloaded: ${conversionId} - ${downloadFilename}`);

    // Clean up file after download (optional)
    fileStream.on('end', () => {
      setTimeout(async () => {
        try {
          if (fsSync.existsSync(filePath)) {
            await fs.unlink(filePath);
            console.log(`Cleaned up file: ${filePath}`);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }, 5000); // Delete after 5 seconds
    });

  } catch (error) {
    console.error('Error in file download:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversion history (mock for now)
router.get('/history', (req, res) => {
  try {
    // In production, this would query the database
    const history = Array.from(conversions.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
      .map(conv => ({
        id: conv.id,
        originalFilename: conv.originalFilename,
        sourceFormat: conv.sourceFormat.toUpperCase(),
        targetFormat: conv.targetFormat.toUpperCase(),
        status: conv.status,
        createdAt: conv.createdAt,
        completedAt: conv.completedAt,
        processingTime: conv.processingTime
      }));

    res.json({
      success: true,
      conversions: history,
      total: history.length
    });

  } catch (error) {
    console.error('Error getting conversion history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch conversion endpoint
router.post('/batch-convert', upload.array('files', 10), async (req, res) => {
  try {
    const { targetFormat } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!targetFormat) {
      return res.status(400).json({ error: 'Target format is required' });
    }

    const batchId = uuidv4();
    const conversionIds = [];

    // Create conversion records for each file
    for (const file of files) {
      const conversionId = uuidv4();
      const inputFormat = path.extname(file.originalname).slice(1).toLowerCase();

      conversions.set(conversionId, {
        id: conversionId,
        batchId,
        originalFilename: file.originalname,
        sourceFormat: inputFormat,
        targetFormat: targetFormat.toLowerCase(),
        fileSize: file.size,
        status: 'pending',
        createdAt: new Date().toISOString(),
        inputPath: file.path
      });

      conversionIds.push(conversionId);
    }

    // Start batch conversion process
    setImmediate(async () => {
      for (const conversionId of conversionIds) {
        try {
          const conversion = conversions.get(conversionId);
          conversion.status = 'processing';
          conversion.startedAt = new Date().toISOString();

          const result = await conversionEngine.convertFile(
            conversion.inputPath,
            conversion.targetFormat,
            { aiEnhanced: true }
          );

          if (result.success) {
            const finalPath = path.join('uploads', `${conversionId}.${conversion.targetFormat}`);
            await fs.copyFile(result.outputPath, finalPath);
            
            conversion.status = 'completed';
            conversion.downloadUrl = `/api/conversion/download/${conversionId}`;
            conversion.convertedFilename = `${conversionId}.${conversion.targetFormat}`;
            conversion.completedAt = new Date().toISOString();

            // Clean up temporary files
            if (fsSync.existsSync(result.outputPath) && result.outputPath !== finalPath) {
              await fs.unlink(result.outputPath);
            }
            if (fsSync.existsSync(conversion.inputPath)) {
              await fs.unlink(conversion.inputPath);
            }
          } else {
            conversion.status = 'failed';
            conversion.error = result.error;
            conversion.completedAt = new Date().toISOString();
          }
        } catch (error) {
          console.error(`Batch conversion error for ${conversionId}:`, error);
          const conversion = conversions.get(conversionId);
          if (conversion) {
            conversion.status = 'failed';
            conversion.error = error.message;
            conversion.completedAt = new Date().toISOString();
          }
        }
      }
    });

    res.json({
      success: true,
      batchId,
      conversionIds,
      message: `Batch conversion started for ${files.length} files`,
      totalFiles: files.length
    });

  } catch (error) {
    console.error('Error in batch conversion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get batch conversion status
router.get('/batch-status/:batchId', (req, res) => {
  try {
    const { batchId } = req.params;
    
    const batchConversions = Array.from(conversions.values())
      .filter(conv => conv.batchId === batchId);

    if (batchConversions.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const completed = batchConversions.filter(conv => conv.status === 'completed').length;
    const failed = batchConversions.filter(conv => conv.status === 'failed').length;
    const processing = batchConversions.filter(conv => conv.status === 'processing').length;
    const pending = batchConversions.filter(conv => conv.status === 'pending').length;

    const overallProgress = Math.round((completed / batchConversions.length) * 100);
    const overallStatus = completed === batchConversions.length ? 'completed' :
                         failed === batchConversions.length ? 'failed' :
                         processing > 0 || pending > 0 ? 'processing' : 'pending';

    res.json({
      success: true,
      batchId,
      status: overallStatus,
      progress: overallProgress,
      summary: {
        total: batchConversions.length,
        completed,
        failed,
        processing,
        pending
      },
      conversions: batchConversions.map(conv => ({
        id: conv.id,
        filename: conv.originalFilename,
        status: conv.status,
        downloadUrl: conv.downloadUrl,
        error: conv.error
      }))
    });

  } catch (error) {
    console.error('Error getting batch status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download all files in a batch as ZIP
router.get('/download-batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const batchConversions = Array.from(conversions.values())
      .filter(conv => conv.batchId === batchId && conv.status === 'completed');

    if (batchConversions.length === 0) {
      return res.status(404).json({ error: 'No completed conversions found for this batch' });
    }

    // Create ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipFilename = `batch_${batchId}_converted.zip`;

    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
    res.setHeader('Content-Type', 'application/zip');

    archive.pipe(res);

    // Add each converted file to the archive
    for (const conversion of batchConversions) {
      const filePath = path.join('uploads', conversion.convertedFilename);
      if (fsSync.existsSync(filePath)) {
        const originalName = path.parse(conversion.originalFilename).name;
        const downloadName = `${originalName}_converted.${conversion.targetFormat}`;
        archive.file(filePath, { name: downloadName });
      }
    }

    await archive.finalize();

    console.log(`Batch download completed: ${batchId} (${batchConversions.length} files)`);

  } catch (error) {
    console.error('Error in batch download:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversion statistics
router.get('/stats', (req, res) => {
  try {
    const allConversions = Array.from(conversions.values());
    const completed = allConversions.filter(conv => conv.status === 'completed').length;
    const failed = allConversions.filter(conv => conv.status === 'failed').length;
    const processing = allConversions.filter(conv => conv.status === 'processing').length;

    // Format statistics
    const formatStats = {};
    allConversions.forEach(conv => {
      const conversionType = `${conv.sourceFormat}-${conv.targetFormat}`;
      formatStats[conversionType] = (formatStats[conversionType] || 0) + 1;
    });

    res.json({
      success: true,
      statistics: {
        total: allConversions.length,
        completed,
        failed,
        processing,
        successRate: allConversions.length > 0 ? Math.round((completed / allConversions.length) * 100) : 0,
        formatBreakdown: formatStats,
        supportedFormats: Object.values(conversionEngine.getAllSupportedFormats()).reduce((sum, cat) => sum + cat.formats.length, 0)
      }
    });

  } catch (error) {
    console.error('Error getting conversion stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;