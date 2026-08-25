CREATE TABLE "Submission" (
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
);

CREATE UNIQUE INDEX "Submission_sourceUrl_key" ON "Submission"("sourceUrl");
CREATE INDEX "Submission_createdAt_idx" ON "Submission"("createdAt");
