import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { kafkaService, KAFKA_TOPICS, EVENT_TYPES } from '../config/kafka';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    planType: string;
  };
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    // Verify token with AuthService
    const user = await AuthService.verifyToken(token);

    if (!user) {
      logger.error('Token verification failed');
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user to request object
    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      planType: user.subscriptionTier
    };
    next();

  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requirePlan = (requiredPlan: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const planHierarchy = { free: 0, pro: 1, enterprise: 2 };
    const userPlanLevel = planHierarchy[req.user.planType as keyof typeof planHierarchy] || 0;
    const requiredPlanLevel = planHierarchy[requiredPlan as keyof typeof planHierarchy] || 0;

    if (userPlanLevel < requiredPlanLevel) {
      return res.status(403).json({ 
        error: `This feature requires a ${requiredPlan} plan or higher` 
      });
    }

    next();
  };
};