import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../server';
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
  private supportedFormats = {
    images: {
      input: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg'],
      output: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'pdf']
    },
    documents: {
      input: ['pdf', 'docx', 'doc', 'txt', 'rtf'],
      output: ['pdf', 'docx', 'txt', 'html']
    },
    data: {
      input: ['json', 'xml', 'csv'],
      output: ['json', 'xml', 'csv', 'xlsx']
    }
  };

  getSupportedFormats() {
    return this.supportedFormats;
  }

  async convertFile(request: ConversionRequest) {
    try {
      // Update status to processing
      await this.updateConversionStatus(request.conversionId, 'processing');

      // Simulate conversion process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const outputFilename = `${uuidv4()}.${request.outputFormat}`;
      const outputPath = path.join('uploads', outputFilename);

      // For demo purposes, copy the input file as output
      await fs.copyFile(request.inputPath, outputPath);

      // Update conversion record with success
      const downloadUrl = `/api/conversion/download/${request.conversionId}`;

      await supabase
        .from('conversions')
        .update({
          status: 'completed',
          converted_filename: outputFilename,
          download_url: downloadUrl,
          conversion_time: 2000
        })
        .eq('id', request.conversionId);

      // Clean up input file
      await fs.unlink(request.inputPath).catch(() => {});

      logger.info(`Conversion completed: ${request.conversionId}`);

    } catch (error) {
      logger.error(`Conversion failed: ${request.conversionId}`, error);
      
      await supabase
        .from('conversions')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', request.conversionId);

      // Clean up input file
      await fs.unlink(request.inputPath).catch(() => {});
    }
  }

  private async updateConversionStatus(conversionId: string, status: string) {
    await supabase
      .from('conversions')
      .update({ status })
      .eq('id', conversionId);
  }
}