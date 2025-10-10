import { PrismaClient } from '@prisma/client';

declare global {
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.cachedPrisma;
}

export { prisma };

// Database connection health check
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', message: 'Database connection successful' };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

// Handle process termination
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

