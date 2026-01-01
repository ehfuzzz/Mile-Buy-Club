-- CreateTable
CREATE TABLE "OnboardingChatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "state" JSONB NOT NULL,
    "messages" JSONB NOT NULL,

    CONSTRAINT "OnboardingChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OnboardingChatSession_userId_idx" ON "OnboardingChatSession"("userId");
