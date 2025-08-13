import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
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
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Mock database for conversions
interface ConversionRecord {
  id: string;
  originalFilename: string;
  sourceFormat: string;
  targetFormat: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  aiEnhanced: boolean;
  createdAt: string;
  downloadUrl?: string;
  convertedFilename?: string;
  completedAt?: string;
  error?: string;
}

const conversions: { [id: string]: ConversionRecord } = {};

// OpenRouter API integration
async function convertWithOpenRouter(inputPath: string, originalFilename: string, targetFormat: string): Promise<{ success: boolean; outputPath?: string; error?: string }> {
  try {
    const apiKey = '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';
    
    // Read input file
    const inputContent = fs.readFileSync(inputPath, 'utf-8');
    const sourceFormat = path.extname(originalFilename).slice(1).toLowerCase();
    
    // Prepare prompt for AI conversion
    const prompt = `Convert the following ${sourceFormat.toUpperCase()} content to ${targetFormat.toUpperCase()} format. Please enhance the content with improved formatting, clarity, and structure while maintaining the original meaning. Provide only the converted content without any explanations or additional text.

INPUT CONTENT:
${inputContent}

OUTPUT FORMAT: ${targetFormat.toUpperCase()}
CONVERTED CONTENT:`;

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://docme-in.com',
        'X-Title': 'DOCMe File Converter'
      },
      body: JSON.stringify({
        model: 'google/gemma-2-9b-it:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.1,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json() as any;
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response choices from OpenRouter API');
    }

    const convertedContent = data.choices[0].message.content;
    
    if (!convertedContent) {
      throw new Error('Empty response from OpenRouter API');
    }

    // Generate output path
    const outputDir = path.dirname(inputPath);
    const outputFilename = `${path.parse(originalFilename).name}_converted.${targetFormat}`;
    const outputPath = path.join(outputDir, outputFilename);

    // Save converted content
    fs.writeFileSync(outputPath, convertedContent, 'utf-8');

    console.log(`AI conversion completed: ${outputPath}`);
    return { success: true, outputPath };

  } catch (error) {
    console.error('Error in AI file conversion:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Conversion endpoints
app.get('/api/conversion/formats', (req, res) => {
  const formats = {
    text: ['txt', 'md', 'html', 'rtf'],
    document: ['pdf', 'docx', 'odt'],
    spreadsheet: ['xlsx', 'csv', 'ods'],
    presentation: ['pptx', 'odp'],
    markup: ['html', 'xml', 'json'],
    code: ['js', 'ts', 'py', 'java', 'cpp', 'c'],
    data: ['json', 'xml', 'csv', 'yaml']
  };
  res.json({ formats });
});

app.post('/api/conversion/convert', upload.single('file'), async (req, res) => {
  try {
    const { targetFormat, aiEnhanced = 'true' } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const conversionId = uuidv4();
    
    // Create conversion record
    conversions[conversionId] = {
      id: conversionId,
      originalFilename: file.originalname,
      sourceFormat: path.extname(file.originalname).slice(1).toLowerCase(),
      targetFormat: targetFormat.toLowerCase(),
      fileSize: file.size,
      status: 'pending',
      aiEnhanced: aiEnhanced === 'true',
      createdAt: new Date().toISOString()
    };

    // Start conversion process
    setImmediate(async () => {
      try {
        // Update status to processing
        conversions[conversionId].status = 'processing';
        
        // Perform AI-powered conversion
        const result = await convertWithOpenRouter(file.path, file.originalname, targetFormat);

        if (result.success && result.outputPath) {
          // Move converted file to final location
          const finalPath = path.join('uploads', `${conversionId}.${targetFormat}`);
          fs.copyFileSync(result.outputPath, finalPath);
          
          // Clean up temporary files
          if (fs.existsSync(result.outputPath)) {
            fs.unlinkSync(result.outputPath);
          }
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }

          // Update conversion record
          conversions[conversionId].status = 'completed';
          conversions[conversionId].downloadUrl = `/api/conversion/download/${conversionId}`;
          conversions[conversionId].convertedFilename = `${conversionId}.${targetFormat}`;
          conversions[conversionId].completedAt = new Date().toISOString();
        } else {
          conversions[conversionId].status = 'failed';
          conversions[conversionId].error = result.error || 'Conversion failed';
          
          // Clean up input file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      } catch (error) {
        console.error('Conversion process error:', error);
        conversions[conversionId].status = 'failed';
        conversions[conversionId].error = error instanceof Error ? error.message : 'Unknown error';
        
        // Clean up input file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    });

    res.json({
      conversionId,
      status: 'pending',
      message: 'Conversion started successfully'
    });

  } catch (error) {
    console.error('Error in file conversion endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/conversion/status/:conversionId', (req, res) => {
  try {
    const { conversionId } = req.params;
    const conversion = conversions[conversionId];

    if (!conversion) {
      return res.status(404).json({ error: 'Conversion not found' });
    }

    res.json({
      id: conversion.id,
      status: conversion.status,
      progress: conversion.status === 'completed' ? 100 : 
                conversion.status === 'processing' ? 50 : 0,
      downloadUrl: conversion.downloadUrl,
      error: conversion.error,
      createdAt: conversion.createdAt
    });

  } catch (error) {
    console.error('Error getting conversion status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/conversion/download/:conversionId', (req, res) => {
  try {
    const { conversionId } = req.params;
    const conversion = conversions[conversionId];

    if (!conversion) {
      return res.status(404).json({ error: 'Conversion not found' });
    }

    if (conversion.status !== 'completed') {
      return res.status(400).json({ error: 'Conversion not completed yet' });
    }

    const filePath = path.join('uploads', conversion.convertedFilename || '');
    
    if (!conversion.convertedFilename || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    const originalName = path.parse(conversion.originalFilename).name;
    const downloadFilename = `${originalName}_converted.${conversion.targetFormat}`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    console.log(`File downloaded: ${conversionId}`);

  } catch (error) {
    console.error('Error in file download:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'DOCMe API Server is running', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DOCMe API Server running on http://localhost:${PORT}`);
  console.log(`📄 Conversion API available at http://localhost:${PORT}/api/conversion`);
  console.log(`🤖 OpenRouter AI integration active`);
});

export default app;
