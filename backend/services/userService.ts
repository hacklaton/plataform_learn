import { UserRepository } from '../repositories/user.repository.js';
import { HashUtil } from '../utils/hash.util.js';
import { JwtUtil } from '../utils/jwt.util.js';
import { redis } from '../libs/redis.js';
import { CacheKeys } from '../constants/cacheKeys.js';
import { Role } from '../constants/roles.js';
import { JWT } from '../constants/jwt.js';
import { UserSafeDto } from '../interfaces/user.interface.js';
import { TokenPair } from '../interfaces/auth.interface.js';

const CACHE_TTL = 300; // 5 minutes

export class UserService {
  private static mapToSafeDto(user: any): UserSafeDto {
    let profile = null;
    if (user.role === Role.ADMIN) profile = user.adminProfile;
    else if (user.role === Role.TEACHER) profile = user.teacherProfile;
    else if (user.role === Role.STUDENT) profile = user.studentProfile;
    else if (user.role === Role.GUARDIAN) profile = user.guardianProfile;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile,
    };
  }

  static async register(dto: {
    email: string;
    passwordHash: string; // we'll pass hash directly or hash inside the service
    role: Role;
    firstName: string;
    lastName: string;
    department?: string;
    enrollmentCode?: string;
    grade?: string;
    phone?: string;
  }): Promise<{ user: UserSafeDto; tokens: TokenPair }> {
    // 1. Check if user already exists
    const existingUser = await UserRepository.findByEmail(dto.email);
    if (existingUser) {
      const error: any = new Error('A user with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    // 2. Hash Password
    const passwordHash = await HashUtil.hashPassword(dto.passwordHash);

    // 3. Create User in DB
    const user = await UserRepository.create({
      ...dto,
      passwordHash,
    });

    if (!user) {
      throw new Error('Failed to create user');
    }

    const safeUser = this.mapToSafeDto(user);

    // 4. Generate Tokens
    const { token: accessToken } = JwtUtil.signAccessToken({ id: user.id, email: user.email, role: user.role });
    const { token: refreshToken } = JwtUtil.signRefreshToken({ id: user.id, email: user.email, role: user.role });

    // 5. Store Refresh Token in Redis
    await redis.set(CacheKeys.refreshToken(user.id), refreshToken, 'EX', JWT.REFRESH_TTL_SEC);

    // 6. Cache user
    await redis.set(CacheKeys.user(user.id), JSON.stringify(safeUser), 'EX', CACHE_TTL);

    return { user: safeUser, tokens: { accessToken, refreshToken } };
  }

  static async login(email: string, passwordPlain: string): Promise<{ user: UserSafeDto; tokens: TokenPair }> {
    // 1. Find user
    const user = await UserRepository.findByEmail(email);
    if (!user || !user.isActive) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // 2. Verify password
    const isPasswordValid = await HashUtil.comparePassword(passwordPlain, user.password);
    if (!isPasswordValid) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const safeUser = this.mapToSafeDto(user);

    // 3. Generate Tokens
    const { token: accessToken } = JwtUtil.signAccessToken({ id: user.id, email: user.email, role: user.role });
    const { token: refreshToken } = JwtUtil.signRefreshToken({ id: user.id, email: user.email, role: user.role });

    // 4. Store Refresh Token in Redis
    await redis.set(CacheKeys.refreshToken(user.id), refreshToken, 'EX', JWT.REFRESH_TTL_SEC);

    // 5. Cache user
    await redis.set(CacheKeys.user(user.id), JSON.stringify(safeUser), 'EX', CACHE_TTL);

    return { user: safeUser, tokens: { accessToken, refreshToken } };
  }

  static async refresh(token: string): Promise<TokenPair> {
    // 1. Verify Refresh Token
    let payload;
    try {
      payload = JwtUtil.verifyRefreshToken(token);
    } catch (err) {
      const error: any = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    // 2. Check stored token in Redis
    const storedToken = await redis.get(CacheKeys.refreshToken(payload.sub));
    if (!storedToken || storedToken !== token) {
      const error: any = new Error('Session has expired or token is invalid');
      error.statusCode = 401;
      throw error;
    }

    // 3. Generate new tokens
    const { token: accessToken } = JwtUtil.signAccessToken({ id: payload.sub, email: payload.email, role: payload.role });
    const { token: refreshToken } = JwtUtil.signRefreshToken({ id: payload.sub, email: payload.email, role: payload.role });

    // 4. Update Refresh Token in Redis
    await redis.set(CacheKeys.refreshToken(payload.sub), refreshToken, 'EX', JWT.REFRESH_TTL_SEC);

    return { accessToken, refreshToken };
  }

  static async logout(accessTokenJti: string, userId: string): Promise<void> {
    // Blacklist the access token (with a safety duration of 15 minutes)
    await redis.set(CacheKeys.blacklist(accessTokenJti), 'true', 'EX', 15 * 60);
    // Delete refresh token from Redis
    await redis.del(CacheKeys.refreshToken(userId));
    // Clear user cache
    await redis.del(CacheKeys.user(userId));
  }

  static async getProfile(userId: string): Promise<UserSafeDto> {
    const cached = await redis.get(CacheKeys.user(userId));
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await UserRepository.findById(userId);
    if (!user || !user.isActive) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const safeUser = this.mapToSafeDto(user);
    await redis.set(CacheKeys.user(userId), JSON.stringify(safeUser), 'EX', CACHE_TTL);
    return safeUser;
  }

  static async getUserById(id: string): Promise<UserSafeDto> {
    return this.getProfile(id);
  }

  static async getAllUsers(filters: { role?: Role; isActive?: boolean }): Promise<UserSafeDto[]> {
    const users = await UserRepository.findAll(filters);
    return users.map(user => this.mapToSafeDto(user));
  }

  static async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      department?: string;
      grade?: string;
      phone?: string;
      isActive?: boolean;
    }
  ): Promise<UserSafeDto> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const updatedUser = await UserRepository.update(userId, user.role, data);
    const safeUser = this.mapToSafeDto(updatedUser);

    // Clear cache
    await redis.del(CacheKeys.user(userId));

    return safeUser;
  }

  static async changePassword(
    userId: string,
    data: { currentPassword?: string; newPassword?: string }
  ): Promise<void> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (data.currentPassword && data.newPassword) {
      const isValid = await HashUtil.comparePassword(data.currentPassword, user.password);
      if (!isValid) {
        const error: any = new Error('Incorrect current password');
        error.statusCode = 400;
        throw error;
      }

      const passwordHash = await HashUtil.hashPassword(data.newPassword);
      await UserRepository.updatePassword(userId, passwordHash);
      
      // Clear cache
      await redis.del(CacheKeys.user(userId));
    }
  }

  static async deactivateUser(userId: string): Promise<void> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    await UserRepository.update(userId, user.role, { isActive: false });

    // Clean cache and session
    await redis.del(CacheKeys.user(userId));
    await redis.del(CacheKeys.refreshToken(userId));
  }
}
