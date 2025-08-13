import { prisma } from '../lib/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface CreateUserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  // Create new user
  static async createUser(userData: CreateUserData) {
    const { email, password, firstName, lastName, username } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        username,
        subscriptionTier: 'FREE',
        monthlyConversions: 0,
        totalConversions: 0
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        subscriptionTier: true,
        emailVerified: true,
        createdAt: true
      }
    });

    // Log user registration
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user_registration',
        resource: 'user',
        resourceId: user.id,
        ipAddress: 'system',
        userAgent: 'system',
        requestId: `reg_${Date.now()}`,
        legalBasis: 'contract',
        processingPurpose: 'account_creation'
      }
    });

    return user;
  }

  // Login user
  static async loginUser(loginData: LoginData, ipAddress: string, userAgent: string) {
    const { email, password } = loginData;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error('Account is temporarily locked due to too many failed attempts');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = user.loginAttempts + 1;
      const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null; // 30 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          lockedUntil: lockUntil
        }
      });

      // Log failed login attempt
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'failed_login',
          resource: 'user',
          resourceId: user.id,
          ipAddress,
          userAgent,
          requestId: `login_fail_${Date.now()}`,
          legalBasis: 'legitimate_interest',
          processingPurpose: 'security_monitoring'
        }
      });

      throw new Error('Invalid email or password');
    }

    // Successful login - reset attempts and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    });

    // Log successful login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'successful_login',
        resource: 'user',
        resourceId: user.id,
        ipAddress,
        userAgent,
        requestId: `login_success_${Date.now()}`,
        legalBasis: 'contract',
        processingPurpose: 'service_provision'
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        subscriptionTier: user.subscriptionTier
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        subscriptionTier: user.subscriptionTier,
        emailVerified: user.emailVerified,
        totalConversions: user.totalConversions
      }
    };
  }

  // Verify JWT token
  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Get current user data
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          subscriptionTier: true,
          emailVerified: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Get user by ID
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        subscriptionTier: true,
        emailVerified: true,
        totalConversions: true,
        monthlyConversions: true,
        subscriptionExpiry: true,
        createdAt: true
      }
    });

    return user;
  }
}
