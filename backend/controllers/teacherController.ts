import { Request, Response, NextFunction } from 'express';
import { TeacherService } from '../services/teacherService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { HTTP } from '../constants/httpStatus.js';

export class TeacherController {
  static async getTeachers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teachers = await TeacherService.list();
      ResponseUtil.success(res, teachers, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async getTeacherById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacher = await TeacherService.getById(String(req.params.id));
      ResponseUtil.success(res, teacher, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async createTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacher = await TeacherService.create(req.body);
      ResponseUtil.success(res, teacher, HTTP.CREATED);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacher = await TeacherService.update(String(req.params.id), req.body);
      ResponseUtil.success(res, teacher, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async deleteTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await TeacherService.remove(String(req.params.id));
      ResponseUtil.success(res, { message: 'Teacher deactivated successfully' }, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }
}
