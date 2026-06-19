export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  refreshToken: (userId: string) => `refresh_token:${userId}`,
  blacklist: (jti: string) => `blacklist:${jti}`,
} as const;
