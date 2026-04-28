import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

type WindowState = {
  count: number;
  resetAt: number;
};

const store = new Map<string, WindowState>();

const getClientIp = (req: Request): string => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || 'unknown';
};

export const publicRateLimit = (config: RateLimitConfig) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const current = store.get(key);

    if (!current || now > current.resetAt) {
      store.set(key, { count: 1, resetAt: now + config.windowMs });
      return next();
    }

    if (current.count >= config.maxRequests) {
      return next(
        new AppError('Too many requests from this IP. Please try again shortly.', 429)
      );
    }

    current.count += 1;
    store.set(key, current);
    return next();
  };
};

export const rejectHoneypot = (fieldName = 'website') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const value = req.body?.[fieldName];
    if (typeof value === 'string' && value.trim().length > 0) {
      return next(new AppError('Spam protection triggered.', 400));
    }

    return next();
  };
};
