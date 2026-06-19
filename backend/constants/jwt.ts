export const JWT = {
  ACCESS_EXPIRES: '15m',
  REFRESH_EXPIRES: '7d',
  REFRESH_TTL_SEC: 60 * 60 * 24 * 7, // 7 days in seconds
} as const;
