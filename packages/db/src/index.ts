import { PrismaClient } from "@prisma/client";

const global = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn", "info"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export { prisma };
