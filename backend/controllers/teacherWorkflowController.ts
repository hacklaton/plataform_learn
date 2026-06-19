import { Request, Response, NextFunction } from 'express';
import { TeacherWorkflowService } from '../services/teacherWorkflowService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { HTTP } from '../constants/httpStatus.js';

export class TeacherWorkflowController {
  static async submitContext(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!.id;
      const workflow = await TeacherWorkflowService.submitContext(teacherId, req.body);
      ResponseUtil.success(res, workflow, HTTP.CREATED);
    } catch (error: any) {
      next(error);
    }
  }

  static async getCurrentWorkflow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!.id;
      const workflow = await TeacherWorkflowService.getCurrentWorkflow(teacherId);
      ResponseUtil.success(res, workflow, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateTopicStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topicId } = req.params;
      const { estado } = req.body;
      const workflow = await TeacherWorkflowService.updateTopicStatus(topicId, estado);
      ResponseUtil.success(res, workflow, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }
}
