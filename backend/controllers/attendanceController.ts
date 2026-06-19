import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendanceService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { HTTP } from '../constants/httpStatus.js';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceController {
  // ── List all records ──────────────────────────────────────
  static async getAttendanceRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = await AttendanceService.getAttendanceRecords();
      ResponseUtil.success(res, records, HTTP.OK);
    } catch (error) { next(error); }
  }

  // ── Live biometric logs ───────────────────────────────────
  static async getLiveLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await AttendanceService.getLiveLogs();
      ResponseUtil.success(res, logs, HTTP.OK);
    } catch (error) { next(error); }
  }

  // ── Face scan / check-in ──────────────────────────────────
  static async scanFace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        ResponseUtil.error(res, 'Image in Base64 format is required', HTTP.BAD_REQUEST);
        return;
      }
      const authUserId = req.user?.id;
      const result = await AttendanceService.scanFace(imageBase64, authUserId);
      ResponseUtil.success(res, result, HTTP.CREATED);
    } catch (error) { next(error); }
  }

  // ── Register face for a user ──────────────────────────────
  static async registerFace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { imageBase64 } = req.body;
      const userId = req.params.userId ?? req.user?.id;

      if (!imageBase64) {
        ResponseUtil.error(res, 'imageBase64 is required', HTTP.BAD_REQUEST);
        return;
      }
      if (!userId) {
        ResponseUtil.error(res, 'userId is required', HTTP.BAD_REQUEST);
        return;
      }

      const result = await AttendanceService.registerFace(userId as string, imageBase64);
      ResponseUtil.success(res, result, HTTP.OK);
    } catch (error) { next(error); }
  }

  // ── Manual mark ───────────────────────────────────────────
  static async manuallyMarkAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId, status } = req.body;
      if (!studentId || !status) {
        ResponseUtil.error(res, 'studentId and status are required', HTTP.BAD_REQUEST);
        return;
      }
      const validStatuses = Object.values(AttendanceStatus);
      if (!validStatuses.includes(status as AttendanceStatus)) {
        ResponseUtil.error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, HTTP.BAD_REQUEST);
        return;
      }
      const record = await AttendanceService.manuallyMarkAttendance(studentId, status as AttendanceStatus);
      ResponseUtil.success(res, record, HTTP.CREATED);
    } catch (error) { next(error); }
  }

  // ── Monthly records ───────────────────────────────────────
  static async getMonthlyAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = parseInt(String(req.query.year || '')) || new Date().getFullYear();
      const month = parseInt(String(req.query.month || '')) || new Date().getMonth() + 1;
      const role = req.query.role ? String(req.query.role) : undefined;
      const userId = req.query.userId ? String(req.query.userId) : undefined;

      if (month < 1 || month > 12) {
        ResponseUtil.error(res, 'month must be between 1 and 12', HTTP.BAD_REQUEST);
        return;
      }

      const data = await AttendanceService.getMonthlyAttendance(year, month, role, userId);
      ResponseUtil.success(res, data, HTTP.OK);
    } catch (error) { next(error); }
  }

  // ── Monthly summary stats ─────────────────────────────────
  static async getMonthlySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = parseInt(String(req.query.year || '')) || new Date().getFullYear();
      const month = parseInt(String(req.query.month || '')) || new Date().getMonth() + 1;
      const summary = await AttendanceService.getMonthlySummary(year, month);
      ResponseUtil.success(res, summary, HTTP.OK);
    } catch (error) { next(error); }
  }

  // ── User monthly summary ──────────────────────────────────
  static async getUserSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.userId);
      const year = parseInt(String(req.query.year || '')) || new Date().getFullYear();
      const month = parseInt(String(req.query.month || '')) || new Date().getMonth() + 1;
      const summary = await AttendanceService.getUserAttendanceSummary(userId, year, month);
      ResponseUtil.success(res, summary, HTTP.OK);
    } catch (error) { next(error); }
  }

  // ── Update record ─────────────────────────────────────────
  static async updateRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { status } = req.body;
      const validStatuses = Object.values(AttendanceStatus);
      if (!status || !validStatuses.includes(status as AttendanceStatus)) {
        ResponseUtil.error(res, `status must be one of: ${validStatuses.join(', ')}`, HTTP.BAD_REQUEST);
        return;
      }
      const updated = await AttendanceService.updateAttendanceRecord(id, status as AttendanceStatus);
      ResponseUtil.success(res, updated, HTTP.OK);
    } catch (error) { next(error); }
  }

  // ── Delete record ─────────────────────────────────────────
  static async deleteRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await AttendanceService.deleteAttendanceRecord(id);
      ResponseUtil.success(res, { success: true }, HTTP.OK);
    } catch (error) { next(error); }
  }
}
