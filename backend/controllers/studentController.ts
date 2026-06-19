import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/studentService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { HTTP } from '../constants/httpStatus.js';

export class StudentController {
  static async getStudents(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const students = await StudentService.list();
      ResponseUtil.success(res, students, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async getStudentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await StudentService.getById(String(req.params.id));
      ResponseUtil.success(res, student, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async createStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await StudentService.create(req.body);
      ResponseUtil.success(res, student, HTTP.CREATED);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await StudentService.update(String(req.params.id), req.body);
      ResponseUtil.success(res, student, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async deleteStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await StudentService.remove(String(req.params.id));
      ResponseUtil.success(res, { message: 'Student deactivated successfully' }, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }
}
