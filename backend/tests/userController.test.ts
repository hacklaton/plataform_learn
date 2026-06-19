import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { UserService } from '../services/userService.js';
import { JwtUtil } from '../utils/jwt.util.js';
import { Role } from '../constants/roles.js';

vi.mock('../services/userService.js', () => ({
  UserService: {
    register: vi.fn(),
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
    getUserById: vi.fn(),
  },
}));

vi.mock('../utils/jwt.util.js', () => ({
  JwtUtil: {
    verifyAccessToken: vi.fn(),
  },
}));

vi.mock('../libs/prisma.js', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

vi.mock('../libs/redis.js', () => ({
  redis: {
    ping: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

describe('AuthController & UserController HTTP Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSafeUser = {
    id: 'user_123',
    email: 'test@example.com',
    role: Role.STUDENT,
    isActive: true,
    createdAt: new Date(),
    profile: {
      firstName: 'Sofía',
      lastName: 'Gómez',
      enrollmentCode: 'STU-001',
    },
  };

  describe('POST /auth/register', () => {
    it('should register successfully and return HTTP 201', async () => {
      vi.mocked(UserService.register).mockResolvedValueOnce({
        user: mockSafeUser as any,
        tokens: { accessToken: 'access_123', refreshToken: 'refresh_123' },
      });

      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
          role: Role.STUDENT,
          firstName: 'Sofía',
          lastName: 'Gómez',
          enrollmentCode: 'STU-001',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBe('access_123');
    });

    it('should return HTTP 400 for validation errors (missing name)', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
          role: Role.STUDENT,
          enrollmentCode: 'STU-001',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully and return tokens', async () => {
      vi.mocked(UserService.login).mockResolvedValueOnce({
        user: mockSafeUser as any,
        tokens: { accessToken: 'access_123', refreshToken: 'refresh_123' },
      });

      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBe('access_123');
    });
  });

  describe('GET /users/me', () => {
    it('should retrieve own profile if authenticated', async () => {
      vi.mocked(JwtUtil.verifyAccessToken).mockReturnValueOnce({
        sub: 'user_123',
        email: 'test@example.com',
        role: Role.STUDENT,
        jti: 'jti_token_123',
      } as any);

      vi.mocked(UserService.getProfile).mockResolvedValueOnce(mockSafeUser as any);

      const res = await request(app)
        .get('/users/me')
        .set('Authorization', 'Bearer valid_token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/users/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
