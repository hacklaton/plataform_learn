import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { prisma } from '../libs/prisma.js';
import { redis } from '../libs/redis.js';

// Mock the prisma and redis queries
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

describe('Express Server Health Check & Welcome Endpoints', () => {
  it('should return welcome message at GET /', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Welcome to Hacklaton Backend API',
      status: 'Running',
    });
  });

  it('should return healthy status when DB and Redis are connected', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([1]);
    vi.mocked(redis.ping).mockResolvedValueOnce('PONG');

    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Healthy');
    expect(res.body.database).toBe('Connected');
    expect(res.body.redis).toBe('Connected');
  });

  it('should return unhealthy status when DB connection fails', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('Connection failure'));
    vi.mocked(redis.ping).mockResolvedValueOnce('PONG');

    const res = await request(app).get('/health');
    expect(res.status).toBe(500);
    expect(res.body.status).toBe('Unhealthy');
    expect(res.body.database).toContain('Error: Connection failure');
    expect(res.body.redis).toBe('Connected');
  });
});
