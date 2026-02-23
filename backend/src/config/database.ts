// Database Configuration - Prisma Client Singleton
// This file creates and exports a single Prisma Client instance for the entire application
import { PrismaClient } from '@prisma/client';

// ==============================
// Singleton Pattern Implementation
// ==============================
// Why use Singleton?
// - Prevents multiple database connections which wastes resources
// - Ensures data consistency across the application
// - Manages connection pool efficiently
// - Allows clean connection cleanup on application shutdown

// Check if Prisma Client already exists in global scope (development mode reloads can recreate this file)
declare global {
  var prisma: PrismaClient | undefined;
}

// Create or reuse existing Prisma Client instance
const prisma: PrismaClient = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' }
      ]
    : [
        { level: 'error', emit: 'stdout' }
      ]
});

// In development, store the Prisma Client in global scope to avoid multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// ==============================
// Query Event Logging (Development Only)
// ==============================
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    console.log(`⏱️  Query: ${e.query}`);
    console.log(`⏱️  Params: ${e.params}`);
    console.log(`⏱️  Duration: ${e.duration}ms\n`);
  });
}

// ==============================
// Graceful Shutdown Handlers
// ==============================

// Handle SIGINT (Ctrl+C in terminal)
process.on('SIGINT', async () => {
  console.log('\n⛔ SIGINT received - disconnecting Prisma Client...');
  await prisma.$disconnect();
  console.log('✅ Prisma Client disconnected');
  process.exit(0);
});

// Handle SIGTERM (process termination signal)
process.on('SIGTERM', async () => {
  console.log('\n⛔ SIGTERM received - disconnecting Prisma Client...');
  await prisma.$disconnect();
  console.log('✅ Prisma Client disconnected');
  process.exit(0);
});

// Export the singleton Prisma Client instance
export default prisma;
