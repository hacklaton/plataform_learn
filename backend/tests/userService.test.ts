import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../services/userService.js';
import { UserRepository } from '../repositories/user.repository.js';
import { HashUtil } from '../utils/hash.util.js';
import { JwtUtil } from '../utils/jwt.util.js';
import { redis } from '../libs/redis.js';
import { Role } from '../constants/roles.js';

// Mock connections and utilities
vi.mock('../repositories/user.repository.js', () => ({
  UserRepository: {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock('../utils/hash.util.js', () => ({
  HashUtil: {
    hashPassword: vi.fn(),
    comparePassword: vi.fn(),
  },
}));

vi.mock('../utils/jwt.util.js', () => ({
  JwtUtil: {
    signAccessToken: vi.fn(),
    signRefreshToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
  },
}));

vi.mock('../libs/redis.js', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

describe('UserService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDbUser = {
    id: 'user_123',
    email: 'test@example.com',
    password: 'hashed_password',
    role: Role.STUDENT,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    studentProfile: {
      firstName: 'Sofía',
      lastName: 'Gómez',
      enrollmentCode: 'STU-001',
    },
  };

  describe('register', () => {
    it('should register a new student and return user safe dto + tokens', async () => {
      vi.mocked(UserRepository.findByEmail).mockResolvedValueOnce(null);
      vi.mocked(HashUtil.hashPassword).mockResolvedValueOnce('hashed_password');
      vi.mocked(UserRepository.create).mockResolvedValueOnce(mockDbUser as any);
      vi.mocked(JwtUtil.signAccessToken).mockReturnValueOnce({ token: 'access_token_123', jti: 'jti_a' });
      vi.mocked(JwtUtil.signRefreshToken).mockReturnValueOnce({ token: 'refresh_token_123', jti: 'jti_b' });
      vi.mocked(redis.set).mockResolvedValue('OK');

      const result = await UserService.register({
        email: 'test@example.com',
        passwordHash: 'Test1234!',
        role: Role.STUDENT,
        firstName: 'Sofía',
        lastName: 'Gómez',
        enrollmentCode: 'STU-001',
      });

      expect(result.tokens.accessToken).toBe('access_token_123');
      expect(result.tokens.refreshToken).toBe('refresh_token_123');
      expect(result.user.id).toBe('user_123');
      expect(result.user.profile.enrollmentCode).toBe('STU-001');
      expect(UserRepository.create).toHaveBeenCalled();
    });

    it('should throw conflict error if email exists', async () => {
      vi.mocked(UserRepository.findByEmail).mockResolvedValueOnce(mockDbUser as any);

      await expect(
        UserService.register({
          email: 'test@example.com',
          passwordHash: 'Test1234!',
          role: Role.STUDENT,
          firstName: 'Sofía',
          lastName: 'Gómez',
          enrollmentCode: 'STU-001',
        })
      ).rejects.toThrow('A user with this email already exists');
    });
  });

  describe('login', () => {
    it('should login valid user and return tokens', async () => {
      vi.mocked(UserRepository.findByEmail).mockResolvedValueOnce(mockDbUser as any);
      vi.mocked(HashUtil.comparePassword).mockResolvedValueOnce(true);
      vi.mocked(JwtUtil.signAccessToken).mockReturnValueOnce({ token: 'access_token_123', jti: 'jti_a' });
      vi.mocked(JwtUtil.signRefreshToken).mockReturnValueOnce({ token: 'refresh_token_123', jti: 'jti_b' });
      vi.mocked(redis.set).mockResolvedValue('OK');

      const result = await UserService.login('test@example.com', 'Test1234!');

      expect(result.tokens.accessToken).toBe('access_token_123');
      expect(result.user.email).toBe('test@example.com');
    });
  });
});
