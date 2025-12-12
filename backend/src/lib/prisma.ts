import { PrismaClient } from "@prisma/client";

// 1. Prevent multiple instances in development
// We attach the prisma instance to the global object so it survives hot-reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["warn", "error"], // Only log warnings and errors to keep console clean
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Log connection success
prisma
  .$connect()
  .then(() => console.log("🗄️  [DATABASE] Connected to Supabase"))
  .catch((err) => console.error("❌ [DATABASE] Connection Failed", err));
