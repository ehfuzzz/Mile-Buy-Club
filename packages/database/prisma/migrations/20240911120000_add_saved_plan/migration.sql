-- CreateEnum
CREATE TYPE "SavedPlanVisibility" AS ENUM ('private', 'public');

-- CreateTable
CREATE TABLE "SavedPlan" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "title" TEXT,
    "visibility" "SavedPlanVisibility" NOT NULL DEFAULT 'private',
    "shareToken" TEXT,
    "queryJson" JSONB NOT NULL,
    "selectedJson" JSONB NOT NULL,
    "provenance" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavedPlan" ADD CONSTRAINT "SavedPlan_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "OnboardingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "SavedPlan_shareToken_key" ON "SavedPlan"("shareToken");
CREATE INDEX "SavedPlan_sessionId_createdAt_idx" ON "SavedPlan"("sessionId", "createdAt");
CREATE INDEX "SavedPlan_visibility_idx" ON "SavedPlan"("visibility");
