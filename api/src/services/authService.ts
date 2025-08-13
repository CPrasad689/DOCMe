import { db } from '../config/database';
import { kafkaService, KAFKA_TOPICS, EVENT_TYPES } from '../config/kafka';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

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
    const existingUserResult = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUserResult.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const userId = uuidv4();
    
    // Create user
    await db.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, username, subscription_tier, monthly_conversions, total_conversions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [userId, email, passwordHash, firstName, lastName, username, 'FREE', 0, 0]);

    const user = {
      id: userId,
      email,
      firstName,
      lastName,
      username,
      subscriptionTier: 'FREE',
      emailVerified: false,
      createdAt: new Date()
    };
    // Publish user registration event to Kafka
    await kafkaService.publishEvent(KAFKA_TOPICS.USER_EVENTS, {
      type: EVENT_TYPES.USER_REGISTERED,
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      subscriptionTier: user.subscriptionTier
    });

    return user;
  }

  // Login user
  static async loginUser(loginData: LoginData, ipAddress: string, userAgent: string) {
    const { email, password } = loginData;

    // Find user
    const userResult = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = userResult.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new Error('Account is temporarily locked due to too many failed attempts');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = user.login_attempts + 1;
      const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null; // 30 minutes

      await db.query(
        'UPDATE users SET login_attempts = $1, locked_until = $2 WHERE id = $3',
        [newAttempts, lockUntil, user.id]
      );

      // Publish failed login event
      await kafkaService.publishEvent(KAFKA_TOPICS.AUDIT_EVENTS, {
        type: 'user.login.failed',
        userId: user.id,
        email: user.email,
        ipAddress,
        userAgent,
        attempts: newAttempts
      });

      throw new Error('Invalid email or password');
    }

    // Successful login - reset attempts and update last login
    await db.query(
      'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Publish successful login event
    await kafkaService.publishEvent(KAFKA_TOPICS.USER_EVENTS, {
      type: EVENT_TYPES.USER_LOGIN,
      userId: user.id,
      email: user.email,
      ipAddress,
      userAgent
    });

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        subscriptionTier: user.subscription_tier
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        subscriptionTier: user.subscription_tier,
        emailVerified: user.email_verified,
        totalConversions: user.total_conversions
      }
    };
  }

  // Verify JWT token
  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Get current user data
      const userResult = await db.query(
        'SELECT id, email, first_name, last_name, username, subscription_tier, email_verified, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
        throw new Error('User not found or inactive');
      }

      const user = userResult.rows[0];
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        subscriptionTier: user.subscription_tier,
        emailVerified: user.email_verified,
        isActive: user.is_active
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Get user by ID
  static async getUserById(userId: string) {
    const userResult = await db.query(`
      SELECT id, email, first_name, last_name, username, subscription_tier, 
             email_verified, total_conversions, monthly_conversions, 
             subscription_expiry, created_at
      FROM users WHERE id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return null;
    }
  }
}

    const user = userResult.rows[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      subscriptionTier: user.subscription_tier,
      emailVerified: user.email_verified,
      totalConversions: user.total_conversions,
      monthlyConversions: user.monthly_conversions,
      subscriptionExpiry: user.subscription_expiry,
      createdAt: user.created_at
    };