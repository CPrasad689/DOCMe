import { prisma } from '../lib/database';
import { ConversionStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

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
    const conversion = await prisma.fileConversion.create({
      data: {
        ...data,
        status: 'PENDING',
        requestId: data.requestId || `conv_${uuidv4()}`,
        downloadExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    // Log the file upload for GDPR compliance
    await prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        action: 'file_upload',
        resource: 'file_conversion',
        resourceId: conversion.id,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent || 'unknown',
        requestId: data.requestId,
        legalBasis: 'contract',
        processingPurpose: 'file_conversion_service'
      }
    });

    return conversion;
  }

  // Update conversion status
  static async updateConversionStatus(
    conversionId: string, 
    status: ConversionStatus,
    result?: ConversionResult
  ) {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'PROCESSING') {
      updateData.conversionStartedAt = new Date();
    } else if (status === 'COMPLETED' || status === 'FAILED') {
      updateData.conversionEndedAt = new Date();
      
      if (result) {
        if (result.success) {
          updateData.convertedFileName = result.convertedFileName;
          updateData.convertedFileSize = result.convertedFileSize;
          updateData.convertedMimeType = result.convertedMimeType;
          updateData.downloadUrl = result.downloadUrl;
          updateData.processingTimeMs = result.processingTimeMs;
          updateData.contentValidated = true;
        } else {
          updateData.errorMessage = result.errorMessage;
          updateData.errorCode = result.errorCode;
        }
      }
    }

    const conversion = await prisma.fileConversion.update({
      where: { id: conversionId },
      data: updateData
    });

    // Update user's conversion count if successful
    if (status === 'COMPLETED' && conversion.userId) {
      await prisma.user.update({
        where: { id: conversion.userId },
        data: {
          totalConversions: { increment: 1 },
          monthlyConversions: { increment: 1 }
        }
      });
    }

    // Log the conversion completion
    await prisma.auditLog.create({
      data: {
        userId: conversion.userId || null,
        action: 'conversion_' + status.toLowerCase(),
        resource: 'file_conversion',
        resourceId: conversion.id,
        ipAddress: conversion.ipAddress,
        userAgent: conversion.userAgent || 'unknown',
        requestId: conversion.requestId,
        legalBasis: 'contract',
        processingPurpose: 'file_conversion_service',
        metadata: result ? {
          processingTimeMs: result.processingTimeMs,
          success: result.success,
          errorCode: result.errorCode
        } : null
      }
    });

    return conversion;
  }

  // Get conversion by ID
  static async getConversionById(conversionId: string, userId?: string) {
    const whereClause: any = { id: conversionId };
    
    // If userId is provided, ensure the user owns the conversion or it's a public conversion
    if (userId) {
      whereClause.OR = [
        { userId: userId },
        { userId: null } // Public/anonymous conversions
      ];
    }

    const conversion = await prisma.fileConversion.findFirst({
      where: whereClause,
      select: {
        id: true,
        originalFileName: true,
        originalFileSize: true,
        inputFormat: true,
        outputFormat: true,
        status: true,
        convertedFileName: true,
        convertedFileSize: true,
        downloadUrl: true,
        downloadExpiry: true,
        downloadCount: true,
        processingTimeMs: true,
        errorMessage: true,
        conversionStartedAt: true,
        conversionEndedAt: true,
        createdAt: true,
        user: userId ? {
          select: {
            id: true,
            email: true
          }
        } : false
      }
    });

    return conversion;
  }

  // Get user's conversion history
  static async getUserConversions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [conversions, total] = await Promise.all([
      prisma.fileConversion.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          originalFileName: true,
          originalFileSize: true,
          inputFormat: true,
          outputFormat: true,
          status: true,
          convertedFileName: true,
          convertedFileSize: true,
          downloadUrl: true,
          downloadExpiry: true,
          downloadCount: true,
          processingTimeMs: true,
          errorMessage: true,
          createdAt: true,
          conversionEndedAt: true
        }
      }),
      prisma.fileConversion.count({ where: { userId } })
    ]);

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
    const conversion = await prisma.fileConversion.findUnique({
      where: { id: conversionId }
    });

    if (!conversion || !conversion.downloadUrl) {
      throw new Error('Conversion not found or no download available');
    }

    // Check if download has expired
    if (conversion.downloadExpiry && conversion.downloadExpiry < new Date()) {
      throw new Error('Download has expired');
    }

    // Update download count
    const updatedConversion = await prisma.fileConversion.update({
      where: { id: conversionId },
      data: {
        downloadCount: { increment: 1 }
      }
    });

    // Log the download for GDPR compliance
    await prisma.auditLog.create({
      data: {
        userId: conversion.userId || null,
        action: 'file_download',
        resource: 'file_conversion',
        resourceId: conversionId,
        ipAddress,
        userAgent: userAgent || 'unknown',
        requestId: `download_${Date.now()}`,
        legalBasis: 'contract',
        processingPurpose: 'file_delivery'
      }
    });

    return updatedConversion;
  }

  // Clean up expired conversions
  static async cleanupExpiredConversions() {
    const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    const expiredConversions = await prisma.fileConversion.findMany({
      where: {
        OR: [
          {
            downloadExpiry: {
              lt: expiredDate
            }
          },
          {
            status: 'FAILED',
            createdAt: {
              lt: expiredDate
            }
          }
        ]
      }
    });

    if (expiredConversions.length > 0) {
      // Log cleanup activity
      await prisma.auditLog.create({
        data: {
          action: 'system_cleanup',
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
        }
      });

      // Delete expired conversions
      await prisma.fileConversion.deleteMany({
        where: {
          id: {
            in: expiredConversions.map(c => c.id)
          }
        }
      });
    }

    return expiredConversions.length;
  }

  // Get conversion statistics
  static async getConversionStats(userId?: string) {
    const whereClause = userId ? { userId } : {};

    const [
      totalConversions,
      successfulConversions,
      failedConversions,
      todayConversions,
      thisMonthConversions
    ] = await Promise.all([
      prisma.fileConversion.count({ where: whereClause }),
      prisma.fileConversion.count({ where: { ...whereClause, status: 'COMPLETED' } }),
      prisma.fileConversion.count({ where: { ...whereClause, status: 'FAILED' } }),
      prisma.fileConversion.count({
        where: {
          ...whereClause,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.fileConversion.count({
        where: {
          ...whereClause,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

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
