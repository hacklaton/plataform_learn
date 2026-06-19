import { describe, it, expect, vi } from 'vitest';
import { redis } from '../libs/redis.js';

// Mock redis
vi.mock('../libs/redis.js', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

describe('Redis Library Client Wrapper', () => {
  it('should successfully set key-value in cache', async () => {
    vi.mocked(redis.set).mockResolvedValueOnce('OK');

    const result = await redis.set('test_key', 'test_value', 'EX', 10);
    expect(result).toBe('OK');
    expect(redis.set).toHaveBeenCalledWith('test_key', 'test_value', 'EX', 10);
  });

  it('should successfully retrieve key-value from cache', async () => {
    vi.mocked(redis.get).mockResolvedValueOnce('test_value');

    const result = await redis.get('test_key');
    expect(result).toBe('test_value');
    expect(redis.get).toHaveBeenCalledWith('test_key');
  });

  it('should return null when key does not exist', async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(null);

    const result = await redis.get('non_existent');
    expect(result).toBeNull();
  });
});
