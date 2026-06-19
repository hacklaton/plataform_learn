import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { UserService } from '../services/userService.js';

// Mock the UserService functions
vi.mock('../services/userService.js', () => ({
  UserService: {
    createUser: vi.fn(),
    getUserById: vi.fn(),
  },
}));

// Mock connections to prevent real database pings in health endpoint during routing initialization
vi.mock('../libs/prisma.js', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

vi.mock('../libs/redis.js', () => ({
  redis: {
    ping: vi.fn(),
  },
}));

describe('UserController / Endpoint Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    id: 'user_123',
    email: 'test@example.com',
    name: 'Test User',
  };

  describe('POST /users', () => {
    it('should return 201 and user object when request is valid', async () => {
      vi.mocked(UserService.createUser).mockResolvedValueOnce(mockUser as any);

      const res = await request(app)
        .post('/users')
        .send({ email: 'test@example.com', name: 'Test User' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockUser);
      expect(UserService.createUser).toHaveBeenCalledWith('test@example.com', 'Test User');
    });

    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/users')
        .send({ name: 'Test User' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Email is required' });
      expect(UserService.createUser).not.toHaveBeenCalled();
    });

    it('should return 400 when user already exists (Prisma conflict code P2002)', async () => {
      const prismaError: any = new Error('Unique constraint failed');
      prismaError.code = 'P2002';
      vi.mocked(UserService.createUser).mockRejectedValueOnce(prismaError);

      const res = await request(app)
        .post('/users')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'A user with this email already exists' });
    });
  });

  describe('GET /users/:id', () => {
    it('should return 200 and user details on database/cache hit', async () => {
      vi.mocked(UserService.getUserById).mockResolvedValueOnce({
        user: mockUser,
        source: 'cache',
      } as any);

      const res = await request(app).get('/users/user_123');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ user: mockUser, source: 'cache' });
      expect(UserService.getUserById).toHaveBeenCalledWith('user_123');
    });

    it('should return 404 when user is not found', async () => {
      vi.mocked(UserService.getUserById).mockResolvedValueOnce({
        user: null,
        source: 'database',
      });

      const res = await request(app).get('/users/non_existent');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'User not found' });
    });
  });
});
