import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({ adapter: process.env.DATABASE_URL as any });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
