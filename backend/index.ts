import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { prisma } from './libs/prisma.js';
import { redis } from './libs/redis.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/users', userRoutes);

// Basic welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Hacklaton Backend API',
    status: 'Running',
  });
});

// Health check endpoint verifying Prisma and Redis
app.get('/health', async (req, res) => {
  let dbStatus = 'Disconnected';
  let redisStatus = 'Disconnected';

  try {
    // Ping PostgreSQL/Prisma
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'Connected';
  } catch (error) {
    dbStatus = `Error: ${(error as Error).message}`;
  }

  try {
    // Ping Redis
    const pingResponse = await redis.ping();
    if (pingResponse === 'PONG') {
      redisStatus = 'Connected';
    }
  } catch (error) {
    redisStatus = `Error: ${(error as Error).message}`;
  }

  const overallStatus = dbStatus === 'Connected' && redisStatus === 'Connected' ? 'Healthy' : 'Unhealthy';

  res.status(overallStatus === 'Healthy' ? 200 : 500).json({
    status: overallStatus,
    database: dbStatus,
    redis: redisStatus,
    timestamp: new Date().toISOString(),
  });
});

// Startup server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===============================================`);
  });
}

export default app;
