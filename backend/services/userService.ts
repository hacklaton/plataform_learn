import { prisma } from '../libs/prisma.js';
import { redis } from '../libs/redis.js';

const CACHE_TTL = 60; // seconds

export class UserService {
  static async createUser(email: string, name?: string) {
    const user = await prisma.user.create({
      data: { email, name },
    });

    // Cache the newly created user immediately
    const cacheKey = `user:${user.id}`;
    try {
      await redis.set(cacheKey, JSON.stringify(user), 'EX', CACHE_TTL);
    } catch (err) {
      console.error('Redis set cache error:', err);
    }

    return user;
  }

  static async getUserById(id: string) {
    const cacheKey = `user:${id}`;

    // 1. Try to get user from Redis
    try {
      const cachedUser = await redis.get(cacheKey);
      if (cachedUser) {
        return { user: JSON.parse(cachedUser), source: 'cache' };
      }
    } catch (err) {
      console.error('Redis get cache error:', err);
    }

    // 2. Fetch from DB on cache miss
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return { user: null, source: 'database' };
    }

    // 3. Cache the DB result in Redis
    try {
      await redis.set(cacheKey, JSON.stringify(user), 'EX', CACHE_TTL);
    } catch (err) {
      console.error('Redis set cache error:', err);
    }

    return { user, source: 'database' };
  }
}
