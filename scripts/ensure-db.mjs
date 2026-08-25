import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Submission" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sourceUrl" TEXT NOT NULL,
      "imageUrl" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "domain" TEXT NOT NULL,
      "format" TEXT NOT NULL,
      "fileSize" INTEGER,
      "score" INTEGER NOT NULL,
      "channelCount" INTEGER NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'Ready',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Submission_sourceUrl_key" ON "Submission"("sourceUrl")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Submission_createdAt_idx" ON "Submission"("createdAt")`);
  console.log("SQLite database is ready.");
} finally {
  await prisma.$disconnect();
}
