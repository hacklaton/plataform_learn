import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { HTTP } from '../constants/httpStatus.js';

export class AnalyticsController {
  static async getCorrelationData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getCorrelationData();
      ResponseUtil.success(res, data, HTTP.OK);
    } catch (error) {
      next(error);
    }
  }

  static async getClusters(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getClusters();
      ResponseUtil.success(res, data, HTTP.OK);
    } catch (error) {
      next(error);
    }
  }

  static async getGreyZoneStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getGreyZoneStudents();
      ResponseUtil.success(res, data, HTTP.OK);
    } catch (error) {
      next(error);
    }
  }

  static async getHistoricalTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getHistoricalTrends();
      ResponseUtil.success(res, data, HTTP.OK);
    } catch (error) {
      next(error);
    }
  }
}
