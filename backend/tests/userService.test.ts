import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../services/userService.js';
import { prisma } from '../libs/prisma.js';
import { redis } from '../libs/redis.js';

// Mock connection singletons
vi.mock('../libs/prisma.js', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../libs/redis.js', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('UserService (Cache-Aside pattern logic)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    id: 'user_123',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('createUser', () => {
    it('should create user in DB and cache it immediately in Redis', async () => {
      vi.mocked(prisma.user.create).mockResolvedValueOnce(mockUser);
      vi.mocked(redis.set).mockResolvedValueOnce('OK');

      const result = await UserService.createUser('test@example.com', 'Test User');

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { email: 'test@example.com', name: 'Test User' },
      });
      expect(redis.set).toHaveBeenCalledWith(
        'user:user_123',
        JSON.stringify(mockUser),
        'EX',
        60
      );
    });
  });

  describe('getUserById', () => {
    it('should return user from Redis cache directly on cache HIT', async () => {
      vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(mockUser));

      const result = await UserService.getUserById('user_123');

      expect(result).toEqual({ user: JSON.parse(JSON.stringify(mockUser)), source: 'cache' });
      expect(redis.get).toHaveBeenCalledWith('user:user_123');
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should query DB and set cache in Redis on cache MISS', async () => {
      vi.mocked(redis.get).mockResolvedValueOnce(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
      vi.mocked(redis.set).mockResolvedValueOnce('OK');

      const result = await UserService.getUserById('user_123');

      expect(result).toEqual({ user: mockUser, source: 'database' });
      expect(redis.get).toHaveBeenCalledWith('user:user_123');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_123' },
      });
      expect(redis.set).toHaveBeenCalledWith(
        'user:user_123',
        JSON.stringify(mockUser),
        'EX',
        60
      );
    });

    it('should return null and not cache if user does not exist in DB on cache MISS', async () => {
      vi.mocked(redis.get).mockResolvedValueOnce(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

      const result = await UserService.getUserById('user_123');

      expect(result).toEqual({ user: null, source: 'database' });
      expect(redis.get).toHaveBeenCalledWith('user:user_123');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_123' },
      });
      expect(redis.set).not.toHaveBeenCalled();
    });
  });
});
