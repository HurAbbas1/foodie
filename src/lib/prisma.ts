import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

if (typeof window === 'undefined') {
  // Extract database file path from connection string (e.g. 'file:./dev.db' -> './dev.db')
  const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';
  const url = rawUrl.startsWith('file:') ? rawUrl.substring(5) : rawUrl;
  
  const adapter = new PrismaBetterSqlite3({ url });
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
} else {
  prisma = null as any;
}

export { prisma };
