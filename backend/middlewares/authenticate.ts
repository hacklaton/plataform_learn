import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt.util.js';
import { redis } from '../libs/redis.js';
import { CacheKeys } from '../constants/cacheKeys.js';
import { HTTP } from '../constants/httpStatus.js';
import { ResponseUtil } from '../utils/response.util.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ResponseUtil.error(res, 'Authentication token missing or invalid', HTTP.UNAUTHORIZED);
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = JwtUtil.verifyAccessToken(token);

    // Check Redis blacklist
    const isBlacklisted = await redis.get(CacheKeys.blacklist(payload.jti));
    if (isBlacklisted) {
      ResponseUtil.error(res, 'Token has been invalidated', HTTP.UNAUTHORIZED);
      return;
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };
    
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      ResponseUtil.error(res, 'Token has expired', HTTP.UNAUTHORIZED);
      return;
    }
    ResponseUtil.error(res, 'Invalid authentication token', HTTP.UNAUTHORIZED);
  }
};
