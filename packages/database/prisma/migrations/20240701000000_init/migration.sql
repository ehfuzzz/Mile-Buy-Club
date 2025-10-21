-- CreateEnum
CREATE TYPE "Cabin" AS ENUM ('Y', 'W', 'J', 'F');

-- CreateEnum
CREATE TYPE "AlertMode" AS ENUM ('HIGH_QUALITY', 'DIGEST');

-- CreateEnum
CREATE TYPE "LocationKind" AS ENUM ('AIRPORT', 'CITY', 'REGION');

-- CreateEnum
CREATE TYPE "DestMode" AS ENUM ('WISH', 'AVOID');

-- CreateEnum
CREATE TYPE "TripStyle" AS ENUM ('BEACH', 'CITY', 'NATURE', 'NIGHTLIFE', 'KID_FRIENDLY', 'PACE_CHILL', 'PACE_PACKED');

-- CreateEnum
CREATE TYPE "InterestTag" AS ENUM ('FOOD_TOURS', 'MUSEUMS', 'HIKES', 'SPORTS', 'SHOWS', 'OTHER');

-- CreateEnum
CREATE TYPE "DietaryTag" AS ENUM ('VEGETARIAN', 'VEGAN', 'HALAL', 'KOSHER', 'NUT_ALLERGY', 'GLUTEN_FREE', 'OTHER');

-- CreateEnum
CREATE TYPE "AccessibilityTag" AS ENUM ('STROLLER_OK', 'WHEELCHAIR', 'HEARING', 'SIGHT', 'OTHER');

-- CreateEnum
CREATE TYPE "Alliance" AS ENUM ('STAR', 'ONEWORLD', 'SKYTEAM', 'NONE');

-- CreateEnum
CREATE TYPE "PrefMode" AS ENUM ('PREFER', 'AVOID');

-- CreateEnum
CREATE TYPE "LoyaltyKind" AS ENUM ('AIR', 'HOTEL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "bio" TEXT,
    "passwordHash" TEXT,
    "avatar" TEXT,
    "emailVerified" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "notificationPreference" TEXT NOT NULL DEFAULT 'daily',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditCard" (
    "cardId" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "annualFeeUsd" INTEGER NOT NULL,
    "rewardsProgram" TEXT NOT NULL,
    "pointValueCents" DOUBLE PRECISION,
    "welcomeOffer" JSONB,
    "metadata" JSONB,
    "perks" JSONB,
    "protections" JSONB,
    "sourceOfTruthUrl" TEXT,
    "lastVerifiedUtc" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditCard_pkey" PRIMARY KEY ("cardId")
);

-- CreateTable
CREATE TABLE "CardEarnRate" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rateX" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardEarnRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardCreditDefinition" (
    "id" TEXT NOT NULL,
    "creditId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountCurrency" TEXT NOT NULL,
    "amountValue" DOUBLE PRECISION NOT NULL,
    "frequencyUnit" TEXT NOT NULL,
    "frequencyResetRule" TEXT NOT NULL,
    "frequencyNYears" INTEGER,
    "eligibility" JSONB,
    "recognition" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardCreditDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardTransferPartner" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "partner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardTransferPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCreditCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "lastFourDigits" TEXT,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCreditCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watcher" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "searchParams" JSONB NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'daily',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notifyEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyPush" BOOLEAN NOT NULL DEFAULT true,
    "minScore" DOUBLE PRECISION NOT NULL DEFAULT 70.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastRunAt" TIMESTAMP(3),

    CONSTRAINT "Watcher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "watcherId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "origin" TEXT,
    "destination" TEXT,
    "departDate" TIMESTAMP(3),
    "returnDate" TIMESTAMP(3),
    "cabin" TEXT,
    "airline" TEXT,
    "availability" INTEGER,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "basePrice" DOUBLE PRECISION,
    "taxes" DOUBLE PRECISION,
    "cashPrice" DOUBLE PRECISION,
    "cashCurrency" TEXT,
    "pointsCashPrice" DOUBLE PRECISION,
    "pointsCashCurrency" TEXT,
    "pointsCashMiles" INTEGER,
    "primaryPricingType" TEXT,
    "pricingOptions" JSONB,
    "milesRequired" INTEGER,
    "cpp" DOUBLE PRECISION,
    "value" DOUBLE PRECISION,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "scoreBreakdown" JSONB,
    "bookingUrl" TEXT,
    "provider" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isNew" BOOLEAN NOT NULL DEFAULT true,
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats_aero_deals" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "airline" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureDate" TIMESTAMP(3),
    "cabin" TEXT,
    "miles" INTEGER,
    "cashPrice" DECIMAL(65,30),
    "bookingUrl" TEXT,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "seats_aero_deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedDeal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "notes" TEXT,
    "isSaved" BOOLEAN NOT NULL DEFAULT true,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "bookingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentVia" TEXT NOT NULL DEFAULT 'push',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isClicked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "travelers" INTEGER NOT NULL DEFAULT 1,
    "budget" DOUBLE PRECISION,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "origin" TEXT,
    "destination" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "travelers" INTEGER,
    "budget" DOUBLE PRECISION,
    "styleTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "llmModel" TEXT,
    "plannerVersion" TEXT DEFAULT 'v1',
    "preferences" JSONB,
    "plan" JSONB,
    "insights" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripPlanDay" (
    "id" TEXT NOT NULL,
    "tripPlanId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "date" TIMESTAMP(3),
    "summary" TEXT,
    "highlights" JSONB,
    "meals" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripPlanDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripPlanExperience" (
    "id" TEXT NOT NULL,
    "tripPlanDayId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "currency" TEXT,
    "bookingUrl" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripPlanExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripPlanId" TEXT,
    "title" TEXT,
    "model" TEXT NOT NULL,
    "persona" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'assistant',
    "temperature" DOUBLE PRECISION DEFAULT 0.4,
    "tone" TEXT DEFAULT 'balanced',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "tokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripPlanId" TEXT,
    "mediaType" TEXT NOT NULL,
    "source" TEXT,
    "prompt" TEXT,
    "inference" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "travelStyles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accommodationStyle" TEXT,
    "diningPreferences" JSONB,
    "accessibilityNeeds" JSONB,
    "pace" TEXT,
    "averageBudget" DOUBLE PRECISION,
    "favoriteAirlines" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bucketList" JSONB,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "kind" "LocationKind" NOT NULL,
    "iata" TEXT,
    "name" TEXT NOT NULL,
    "countryCode" TEXT,
    "regionCode" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "meta" JSONB,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "preferredCabin" "Cabin",
    "companions" INTEGER,
    "openJawOk" BOOLEAN,
    "mixedAirlinesOk" BOOLEAN,
    "dateFlexDays" INTEGER,
    "typicalTripLenMin" INTEGER,
    "typicalTripLenMax" INTEGER,
    "minCppCents" DOUBLE PRECISION,
    "maxCashUsd" INTEGER,
    "maxPoints" INTEGER,
    "alertMode" "AlertMode",
    "timezone" TEXT,
    "rawOnboardingJson" JSONB,
    "rawNotes" TEXT,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserHomeBase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "source" TEXT,

    CONSTRAINT "UserHomeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDestinationPref" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "mode" "DestMode" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "UserDestinationPref_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTripStyle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "style" "TripStyle" NOT NULL,

    CONSTRAINT "UserTripStyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInterest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tag" "InterestTag" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDietary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tag" "DietaryTag" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "UserDietary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccessibility" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tag" "AccessibilityTag" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "UserAccessibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Airline" (
    "code2" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alliance" "Alliance",

    CONSTRAINT "Airline_pkey" PRIMARY KEY ("code2")
);

-- CreateTable
CREATE TABLE "HotelProgram" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "HotelProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAirlinePref" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code2" TEXT NOT NULL,
    "mode" "PrefMode" NOT NULL,

    CONSTRAINT "UserAirlinePref_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAlliancePref" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alliance" "Alliance" NOT NULL,
    "mode" "PrefMode" NOT NULL,

    CONSTRAINT "UserAlliancePref_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserHotelProgramPref" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "mode" "PrefMode" NOT NULL,

    CONSTRAINT "UserHotelProgramPref_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyProgram" (
    "id" TEXT NOT NULL,
    "kind" "LoyaltyKind" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LoyaltyProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLoyaltyBalance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "approxPoints" INTEGER NOT NULL,
    "asOf" TIMESTAMP(3),

    CONSTRAINT "UserLoyaltyBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardCatalog" (
    "cardId" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "productName" TEXT NOT NULL,

    CONSTRAINT "CardCatalog_pkey" PRIMARY KEY ("cardId")
);

-- CreateTable
CREATE TABLE "UserCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3),

    CONSTRAINT "UserCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "dealsFound" INTEGER NOT NULL DEFAULT 0,
    "dealsBooked" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "CreditCard_issuer_idx" ON "CreditCard"("issuer");

-- CreateIndex
CREATE INDEX "CreditCard_network_idx" ON "CreditCard"("network");

-- CreateIndex
CREATE INDEX "CardEarnRate_cardId_idx" ON "CardEarnRate"("cardId");

-- CreateIndex
CREATE INDEX "CardCreditDefinition_cardId_idx" ON "CardCreditDefinition"("cardId");

-- CreateIndex
CREATE INDEX "CardCreditDefinition_creditId_idx" ON "CardCreditDefinition"("creditId");

-- CreateIndex
CREATE INDEX "CardTransferPartner_cardId_idx" ON "CardTransferPartner"("cardId");

-- CreateIndex
CREATE INDEX "CardTransferPartner_partner_idx" ON "CardTransferPartner"("partner");

-- CreateIndex
CREATE INDEX "UserCreditCard_userId_idx" ON "UserCreditCard"("userId");

-- CreateIndex
CREATE INDEX "UserCreditCard_cardId_idx" ON "UserCreditCard"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCreditCard_userId_cardId_key" ON "UserCreditCard"("userId", "cardId");

-- CreateIndex
CREATE INDEX "Watcher_userId_idx" ON "Watcher"("userId");

-- CreateIndex
CREATE INDEX "Watcher_type_idx" ON "Watcher"("type");

-- CreateIndex
CREATE INDEX "Watcher_isActive_idx" ON "Watcher"("isActive");

-- CreateIndex
CREATE INDEX "Watcher_lastRunAt_idx" ON "Watcher"("lastRunAt");

-- CreateIndex
CREATE INDEX "Deal_watcherId_idx" ON "Deal"("watcherId");

-- CreateIndex
CREATE INDEX "Deal_userId_idx" ON "Deal"("userId");

-- CreateIndex
CREATE INDEX "Deal_type_idx" ON "Deal"("type");

-- CreateIndex
CREATE INDEX "Deal_status_idx" ON "Deal"("status");

-- CreateIndex
CREATE INDEX "Deal_score_idx" ON "Deal"("score");

-- CreateIndex
CREATE INDEX "Deal_createdAt_idx" ON "Deal"("createdAt");

-- CreateIndex
CREATE INDEX "Deal_expiresAt_idx" ON "Deal"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_watcherId_provider_externalId_key" ON "Deal"("watcherId", "provider", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "seats_aero_deals_externalId_key" ON "seats_aero_deals"("externalId");

-- CreateIndex
CREATE INDEX "SavedDeal_userId_idx" ON "SavedDeal"("userId");

-- CreateIndex
CREATE INDEX "SavedDeal_isSaved_idx" ON "SavedDeal"("isSaved");

-- CreateIndex
CREATE UNIQUE INDEX "SavedDeal_userId_dealId_key" ON "SavedDeal"("userId", "dealId");

-- CreateIndex
CREATE INDEX "Alert_userId_idx" ON "Alert"("userId");

-- CreateIndex
CREATE INDEX "Alert_dealId_idx" ON "Alert"("dealId");

-- CreateIndex
CREATE INDEX "Alert_isRead_idx" ON "Alert"("isRead");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_userId_dealId_type_key" ON "Alert"("userId", "dealId", "type");

-- CreateIndex
CREATE INDEX "Trip_userId_idx" ON "Trip"("userId");

-- CreateIndex
CREATE INDEX "Trip_status_idx" ON "Trip"("status");

-- CreateIndex
CREATE INDEX "TripPlan_userId_idx" ON "TripPlan"("userId");

-- CreateIndex
CREATE INDEX "TripPlan_destination_idx" ON "TripPlan"("destination");

-- CreateIndex
CREATE INDEX "TripPlan_createdAt_idx" ON "TripPlan"("createdAt");

-- CreateIndex
CREATE INDEX "TripPlanDay_tripPlanId_idx" ON "TripPlanDay"("tripPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "TripPlanDay_tripPlanId_dayNumber_key" ON "TripPlanDay"("tripPlanId", "dayNumber");

-- CreateIndex
CREATE INDEX "TripPlanExperience_tripPlanDayId_idx" ON "TripPlanExperience"("tripPlanDayId");

-- CreateIndex
CREATE INDEX "AiSession_userId_idx" ON "AiSession"("userId");

-- CreateIndex
CREATE INDEX "AiSession_tripPlanId_idx" ON "AiSession"("tripPlanId");

-- CreateIndex
CREATE INDEX "AiSession_createdAt_idx" ON "AiSession"("createdAt");

-- CreateIndex
CREATE INDEX "AiMessage_sessionId_idx" ON "AiMessage"("sessionId");

-- CreateIndex
CREATE INDEX "AiMessage_createdAt_idx" ON "AiMessage"("createdAt");

-- CreateIndex
CREATE INDEX "MediaInsight_userId_idx" ON "MediaInsight"("userId");

-- CreateIndex
CREATE INDEX "MediaInsight_tripPlanId_idx" ON "MediaInsight"("tripPlanId");

-- CreateIndex
CREATE INDEX "MediaInsight_createdAt_idx" ON "MediaInsight"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "Location_kind_iata_idx" ON "Location"("kind", "iata");

-- CreateIndex
CREATE INDEX "Location_name_idx" ON "Location"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserLoyaltyBalance_userId_programId_key" ON "UserLoyaltyBalance"("userId", "programId");

-- CreateIndex
CREATE INDEX "OnboardingMessage_sessionId_idx" ON "OnboardingMessage"("sessionId");

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "Event"("userId");

-- CreateIndex
CREATE INDEX "Event_eventType_idx" ON "Event"("eventType");

-- CreateIndex
CREATE INDEX "Event_createdAt_idx" ON "Event"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_date_key" ON "Analytics"("date");

-- CreateIndex
CREATE INDEX "Analytics_date_idx" ON "Analytics"("date");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardEarnRate" ADD CONSTRAINT "CardEarnRate_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CreditCard"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardCreditDefinition" ADD CONSTRAINT "CardCreditDefinition_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CreditCard"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardTransferPartner" ADD CONSTRAINT "CardTransferPartner_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CreditCard"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCreditCard" ADD CONSTRAINT "UserCreditCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCreditCard" ADD CONSTRAINT "UserCreditCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CreditCard"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watcher" ADD CONSTRAINT "Watcher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_watcherId_fkey" FOREIGN KEY ("watcherId") REFERENCES "Watcher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedDeal" ADD CONSTRAINT "SavedDeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripPlan" ADD CONSTRAINT "TripPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripPlanDay" ADD CONSTRAINT "TripPlanDay_tripPlanId_fkey" FOREIGN KEY ("tripPlanId") REFERENCES "TripPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripPlanExperience" ADD CONSTRAINT "TripPlanExperience_tripPlanDayId_fkey" FOREIGN KEY ("tripPlanDayId") REFERENCES "TripPlanDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSession" ADD CONSTRAINT "AiSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSession" ADD CONSTRAINT "AiSession_tripPlanId_fkey" FOREIGN KEY ("tripPlanId") REFERENCES "TripPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiMessage" ADD CONSTRAINT "AiMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AiSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaInsight" ADD CONSTRAINT "MediaInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaInsight" ADD CONSTRAINT "MediaInsight_tripPlanId_fkey" FOREIGN KEY ("tripPlanId") REFERENCES "TripPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHomeBase" ADD CONSTRAINT "UserHomeBase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHomeBase" ADD CONSTRAINT "UserHomeBase_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDestinationPref" ADD CONSTRAINT "UserDestinationPref_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDestinationPref" ADD CONSTRAINT "UserDestinationPref_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTripStyle" ADD CONSTRAINT "UserTripStyle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDietary" ADD CONSTRAINT "UserDietary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccessibility" ADD CONSTRAINT "UserAccessibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAirlinePref" ADD CONSTRAINT "UserAirlinePref_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAirlinePref" ADD CONSTRAINT "UserAirlinePref_code2_fkey" FOREIGN KEY ("code2") REFERENCES "Airline"("code2") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAlliancePref" ADD CONSTRAINT "UserAlliancePref_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHotelProgramPref" ADD CONSTRAINT "UserHotelProgramPref_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHotelProgramPref" ADD CONSTRAINT "UserHotelProgramPref_programId_fkey" FOREIGN KEY ("programId") REFERENCES "HotelProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLoyaltyBalance" ADD CONSTRAINT "UserLoyaltyBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLoyaltyBalance" ADD CONSTRAINT "UserLoyaltyBalance_programId_fkey" FOREIGN KEY ("programId") REFERENCES "LoyaltyProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CardCatalog"("cardId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingSession" ADD CONSTRAINT "OnboardingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingMessage" ADD CONSTRAINT "OnboardingMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "OnboardingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

