import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JwtPayload } from '../interfaces/auth.interface.js';
import { Role } from '../constants/roles.js';
import { JWT } from '../constants/jwt.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_change_in_production';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_change_in_production';

export class JwtUtil {
  static signAccessToken(payload: { id: string; email: string; role: Role }): { token: string; jti: string } {
    const jti = crypto.randomUUID();
    const token = jwt.sign(
      {
        sub: payload.id,
        email: payload.email,
        role: payload.role,
        jti,
      },
      ACCESS_SECRET,
      { expiresIn: JWT.ACCESS_EXPIRES }
    );
    return { token, jti };
  }

  static signRefreshToken(payload: { id: string; email: string; role: Role }): { token: string; jti: string } {
    const jti = crypto.randomUUID();
    const token = jwt.sign(
      {
        sub: payload.id,
        email: payload.email,
        role: payload.role,
        jti,
      },
      REFRESH_SECRET,
      { expiresIn: JWT.REFRESH_EXPIRES }
    );
    return { token, jti };
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
  }
}
