import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateConversion = [
  body('targetFormat')
    .notEmpty()
    .withMessage('Target format is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Target format must be between 2 and 10 characters'),
  
  body('aiEnhanced')
    .optional()
    .isBoolean()
    .withMessage('AI enhanced must be a boolean'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    next();
  }
];

export const validateSubscription = [
  body('priceId')
    .notEmpty()
    .withMessage('Price ID is required'),
  
  body('planType')
    .isIn(['pro', 'enterprise'])
    .withMessage('Plan type must be pro or enterprise'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    next();
  }
];