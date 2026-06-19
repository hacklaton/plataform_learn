import { Request, Response, NextFunction } from 'express';
import { Role } from '../constants/roles.js';
import { HTTP } from '../constants/httpStatus.js';
import { ResponseUtil } from '../utils/response.util.js';

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.error(res, 'User not authenticated', HTTP.UNAUTHORIZED);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      ResponseUtil.error(res, 'Access denied', HTTP.FORBIDDEN);
      return;
    }

    next();
  };
};
