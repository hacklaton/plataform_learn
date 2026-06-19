import { Role } from '../constants/roles.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  jti: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
