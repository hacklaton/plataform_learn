import { Role } from '../constants/roles.js';

export interface UserSafeDto {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile: any;
}
