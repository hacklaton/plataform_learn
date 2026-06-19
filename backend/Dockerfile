FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install

# Copy application files
COPY . .

# Generate Prisma client
RUN pnpm run prisma:generate

# Build the TypeScript project
RUN pnpm run build

# Expose server port
EXPOSE 3001

# Run database migrations/schema push and start the server
CMD ["sh", "-c", "pnpm run db:push && node dist/index.js"]
