import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { HTTP } from '../constants/httpStatus.js';
import { JwtUtil } from '../utils/jwt.util.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, role, firstName, lastName, department, enrollmentCode, grade, phone } = req.body;
      const result = await UserService.register({
        email,
        passwordHash: password,
        role,
        firstName,
        lastName,
        department,
        enrollmentCode,
        grade,
        phone,
      });

      ResponseUtil.success(res, result, HTTP.CREATED);
    } catch (error: any) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      ResponseUtil.success(res, result, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await UserService.refresh(refreshToken);
      ResponseUtil.success(res, tokens, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization!;
      const token = authHeader.split(' ')[1];
      const payload = JwtUtil.verifyAccessToken(token);

      await UserService.logout(payload.jti, req.user!.id);
      ResponseUtil.success(res, { message: 'Logged out successfully' }, HTTP.OK);
    } catch (error: any) {
      next(error);
    }
  }
}
