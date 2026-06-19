import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { HTTP } from '../constants/httpStatus.js';
import { Role } from '../constants/roles.js';

export class UserController {
  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, isActive } = req.query;
      
      const filters: any = {};
      if (role && Object.values(Role).includes(role as Role)) {
        filters.role = role as Role;
      }
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }

      const users = await UserService.getAllUsers(filters);
      ResponseUtil.success(res, users, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await UserService.getProfile(userId);
      ResponseUtil.success(res, profile, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      ResponseUtil.success(res, user, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await UserService.updateProfile(id, req.body);
      ResponseUtil.success(res, updated, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await UserService.changePassword(userId, req.body);
      ResponseUtil.success(res, { message: 'Password updated successfully' }, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await UserService.deactivateUser(id);
      ResponseUtil.success(res, { message: 'User deactivated successfully' }, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }
}
