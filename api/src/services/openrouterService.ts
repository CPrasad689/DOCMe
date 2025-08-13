import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

interface ConversionRequest {
  conversionId: string;
  inputPath: string;
  outputFormat: string;
  originalFilename: string;
  userId?: string;
  aiEnhanced?: boolean;
}

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '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';
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.model = 'google/gemma-2-9b-it:free';
  }

  /**
   * Convert file using OpenRouter AI
   */
  async convertFile(request: ConversionRequest): Promise<{ success: boolean; outputPath?: string; error?: string }> {
    try {
      logger.info(`Starting AI conversion for file: ${request.originalFilename}`);

      // Read input file
      if (!fs.existsSync(request.inputPath)) {
        throw new Error('Input file does not exist');
      }

      const inputContent = await this.readFile(request.inputPath);
      const inputFormat = path.extname(request.originalFilename).slice(1).toLowerCase();

      // Generate output path
      const outputDir = path.dirname(request.inputPath);
      const outputFilename = `${path.parse(request.originalFilename).name}_converted.${request.outputFormat}`;
      const outputPath = path.join(outputDir, outputFilename);

      // Prepare prompt for AI conversion
      const prompt = this.buildConversionPrompt(inputContent, inputFormat, request.outputFormat, request.aiEnhanced);

      // Call OpenRouter API
      const convertedContent = await this.callOpenRouterAPI(prompt);

      // Save converted content
      await this.writeFile(outputPath, convertedContent);

      logger.info(`File conversion completed: ${outputPath}`);
      return { success: true, outputPath };

    } catch (error) {
      logger.error('Error in AI file conversion:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Build conversion prompt for OpenRouter AI
   */
  private buildConversionPrompt(content: string, fromFormat: string, toFormat: string, aiEnhanced?: boolean): string {
    let prompt = `Convert the following ${fromFormat.toUpperCase()} content to ${toFormat.toUpperCase()} format. `;
    
    if (aiEnhanced) {
      prompt += `Please enhance the content with improved formatting, clarity, and structure while maintaining the original meaning. `;
    }
    
    prompt += `Provide only the converted content without any explanations or additional text.\n\n`;
    prompt += `INPUT CONTENT:\n${content}\n\n`;
    prompt += `OUTPUT FORMAT: ${toFormat.toUpperCase()}\n`;
    prompt += `CONVERTED CONTENT:`;

    return prompt;
  }

  /**
   * Call OpenRouter API for content conversion
   */
  private async callOpenRouterAPI(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://docme-in.com',
          'X-Title': 'DOCMe File Converter'
        },
        body: JSON.stringify({
          model: this.model,
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

      const data = await response.json() as OpenRouterResponse;
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response choices from OpenRouter API');
      }

      const convertedContent = data.choices[0].message.content;
      
      if (!convertedContent) {
        throw new Error('Empty response from OpenRouter API');
      }

      logger.info(`OpenRouter API usage: ${data.usage.total_tokens} tokens`);
      return convertedContent;

    } catch (error) {
      logger.error('Error calling OpenRouter API:', error);
      throw error;
    }
  }

  /**
   * Read file content based on format
   */
  private async readFile(filePath: string): Promise<string> {
    try {
      const ext = path.extname(filePath).slice(1).toLowerCase();
      
      // For text-based formats, read as UTF-8
      if (['txt', 'md', 'html', 'css', 'js', 'json', 'xml', 'csv', 'rtf'].includes(ext)) {
        return fs.readFileSync(filePath, 'utf-8');
      }
      
      // For binary formats, read as base64 and indicate format
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');
      return `[BINARY_FILE_${ext.toUpperCase()}]\n${base64}`;
      
    } catch (error) {
      logger.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Write converted content to file
   */
  private async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // Check if content is base64 encoded binary
      if (content.startsWith('[BINARY_FILE_')) {
        const lines = content.split('\n');
        const base64Content = lines.slice(1).join('\n');
        const buffer = Buffer.from(base64Content, 'base64');
        fs.writeFileSync(filePath, buffer);
      } else {
        // Write as text file
        fs.writeFileSync(filePath, content, 'utf-8');
      }
      
    } catch (error) {
      logger.error('Error writing file:', error);
      throw new Error(`Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get supported conversion formats
   */
  getSupportedFormats(): { [key: string]: string[] } {
    return {
      text: ['txt', 'md', 'html', 'rtf'],
      document: ['pdf', 'docx', 'odt'],
      spreadsheet: ['xlsx', 'csv', 'ods'],
      presentation: ['pptx', 'odp'],
      markup: ['html', 'xml', 'json'],
      code: ['js', 'ts', 'py', 'java', 'cpp', 'c'],
      data: ['json', 'xml', 'csv', 'yaml']
    };
  }

  /**
   * Check if conversion is supported
   */
  isConversionSupported(fromFormat: string, toFormat: string): boolean {
    const formats = this.getSupportedFormats();
    const allFormats = Object.values(formats).flat();
    
    return allFormats.includes(fromFormat.toLowerCase()) && 
           allFormats.includes(toFormat.toLowerCase());
  }

  /**
   * Get conversion complexity score (for pricing/limits)
   */
  getConversionComplexity(fromFormat: string, toFormat: string): 'simple' | 'medium' | 'complex' {
    const simpleConversions = [
      'txt-md', 'md-txt', 'txt-html', 'html-txt',
      'csv-json', 'json-csv', 'xml-json', 'json-xml'
    ];
    
    const mediumConversions = [
      'md-html', 'html-md', 'rtf-txt', 'txt-rtf',
      'csv-xlsx', 'xlsx-csv', 'json-yaml', 'yaml-json'
    ];
    
    const conversion = `${fromFormat.toLowerCase()}-${toFormat.toLowerCase()}`;
    
    if (simpleConversions.includes(conversion)) {
      return 'simple';
    } else if (mediumConversions.includes(conversion)) {
      return 'medium';
    } else {
      return 'complex';
    }
  }
}
