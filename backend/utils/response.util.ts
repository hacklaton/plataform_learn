import { Response } from 'express';
import { HTTP } from '../constants/httpStatus.js';

export class ResponseUtil {
  static success<T>(res: Response, data: T, status: number = HTTP.OK) {
    return res.status(status).json({
      success: true,
      data,
    });
  }

  static error(res: Response, message: string, status: number = HTTP.INTERNAL) {
    return res.status(status).json({
      success: false,
      error: message,
    });
  }

  static paginated<T>(res: Response, data: T[], meta: { total: number; page: number; limit: number }, status: number = HTTP.OK) {
    return res.status(status).json({
      success: true,
      data,
      meta,
    });
  }
}
