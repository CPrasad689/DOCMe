import { Request, Response, NextFunction } from 'express';
import { supabase } from '../server';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    plan_type: string;
  };
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.error('Token verification failed:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user details from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, plan_type')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      logger.error('User data fetch failed:', userError);
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user to request object
    (req as AuthenticatedRequest).user = userData;
    next();

  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requirePlan = (requiredPlan: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const planHierarchy = { free: 0, pro: 1, enterprise: 2 };
    const userPlanLevel = planHierarchy[req.user.plan_type as keyof typeof planHierarchy] || 0;
    const requiredPlanLevel = planHierarchy[requiredPlan as keyof typeof planHierarchy] || 0;

    if (userPlanLevel < requiredPlanLevel) {
      return res.status(403).json({ 
        error: `This feature requires a ${requiredPlan} plan or higher` 
      });
    }

    next();
  };
};