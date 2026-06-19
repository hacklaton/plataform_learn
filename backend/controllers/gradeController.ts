import { Request, Response, NextFunction } from 'express';
import { GradeService } from '../services/gradeService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { HTTP } from '../constants/httpStatus.js';

export class GradeController {
  static async getGrades(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId, courseId } = req.query;
      const filters: { studentId?: string; courseId?: string } = {};
      if (typeof studentId === 'string') filters.studentId = studentId;
      if (typeof courseId === 'string') filters.courseId = courseId;

      const grades = await GradeService.list(req.user!, filters);
      ResponseUtil.success(res, grades, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async createGrade(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const grade = await GradeService.create(req.user!, req.body);
      ResponseUtil.success(res, grade, HTTP.CREATED);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateGrade(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const grade = await GradeService.update(req.user!, id, req.body);
      ResponseUtil.success(res, grade, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async deleteGrade(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await GradeService.remove(req.user!, id);
      ResponseUtil.success(res, { message: 'Grade deleted successfully' }, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }
}
