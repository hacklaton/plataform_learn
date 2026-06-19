import { Request, Response, NextFunction } from 'express';
import { HTTP } from '../constants/httpStatus.js';
import { ResponseUtil } from '../utils/response.util.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('Unhandled error:', err);

  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    ResponseUtil.error(res, `Duplicate field value: ${err.meta?.target || 'key already exists'}`, HTTP.CONFLICT);
    return;
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    ResponseUtil.error(res, err.meta?.cause || 'Record not found', HTTP.NOT_FOUND);
    return;
  }

  // JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
     ResponseUtil.error(res, 'Invalid token', HTTP.UNAUTHORIZED);
     return;
  }

  if (err.name === 'TokenExpiredError') {
     ResponseUtil.error(res, 'Token has expired', HTTP.UNAUTHORIZED);
     return;
  }

  // Fallback to 500 Internal Server Error
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message || 'Something went wrong';
  ResponseUtil.error(res, message, HTTP.INTERNAL);
};
