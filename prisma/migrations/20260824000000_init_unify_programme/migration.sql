-- CreateEnum
CREATE TYPE "AppSource" AS ENUM ('formula_programme', 'performance');

-- CreateEnum
CREATE TYPE "LeadTier" AS ENUM ('pro', 'elite');

-- CreateEnum
CREATE TYPE "LeadOutcome" AS ENUM ('qualified', 'disqualified');

-- CreateEnum
CREATE TYPE "ApplicationStep" AS ENUM ('gate', 'vsl', 'qualify', 'routed');

-- CreateEnum
CREATE TYPE "ApplicationRoute" AS ENUM ('high_pro', 'high_elite', 'low', 'nurture');

-- CreateEnum
CREATE TYPE "CalendarProvider" AS ENUM ('google', 'calendly', 'ghl');

-- CreateEnum
CREATE TYPE "BookingTier" AS ENUM ('pro', 'elite');

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "appSource" "AppSource" NOT NULL DEFAULT 'formula_programme',
ADD COLUMN     "product" TEXT NOT NULL DEFAULT 'formula_programme';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "appSource" "AppSource" NOT NULL DEFAULT 'formula_programme',
ADD COLUMN     "product" TEXT NOT NULL DEFAULT 'formula_programme';

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "tier" "LeadTier" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "instagram" TEXT NOT NULL,
    "mainGoal" TEXT,
    "trainingNow" TEXT,
    "daysCommit" TEXT,
    "medical" TEXT,
    "stoppedResults" TEXT,
    "whyNow" TEXT,
    "structuredProgramme" TEXT,
    "investment" TEXT,
    "privacyConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentSource" TEXT NOT NULL,
    "consentAt" TIMESTAMPTZ NOT NULL,
    "outcome" "LeadOutcome" NOT NULL,
    "flags" TEXT[],
    "disqualifyReasons" TEXT[],
    "ghlContactId" TEXT,
    "ghlSyncedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "step" "ApplicationStep" NOT NULL DEFAULT 'gate',
    "droppedAt" TEXT,
    "vslWatchPct" INTEGER NOT NULL DEFAULT 0,
    "route" "ApplicationRoute",
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "mobile" TEXT NOT NULL DEFAULT '',
    "goal" TEXT NOT NULL DEFAULT '',
    "startingPoint" TEXT NOT NULL DEFAULT '',
    "days" TEXT NOT NULL DEFAULT '',
    "obstacles" TEXT[],
    "timeline" TEXT NOT NULL DEFAULT '',
    "coachHistory" TEXT NOT NULL DEFAULT '',
    "investment" TEXT NOT NULL DEFAULT '',
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "utmRaw" JSONB,
    "referrer" TEXT,
    "ghlContactId" TEXT,
    "ghlSyncedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DnaReport" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "emailSentAt" TIMESTAMPTZ,
    "whatsappSentAt" TIMESTAMPTZ,
    "pdfReadyAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "DnaReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarBooking" (
    "id" TEXT NOT NULL,
    "tier" "BookingTier" NOT NULL,
    "provider" "CalendarProvider" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "timezone" TEXT,
    "notes" TEXT,
    "ghlContactId" TEXT,
    "start" TIMESTAMPTZ NOT NULL,
    "end" TIMESTAMPTZ NOT NULL,
    "providerEventId" TEXT,
    "providerLink" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "CalendarBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappOptInEvent" (
    "id" TEXT NOT NULL,
    "ghlContactId" TEXT NOT NULL,
    "optedIn" BOOLEAN NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsappOptInEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Application_email_idx" ON "Application"("email");

-- CreateIndex
CREATE INDEX "Application_route_idx" ON "Application"("route");

-- CreateIndex
CREATE UNIQUE INDEX "DnaReport_token_key" ON "DnaReport"("token");

-- CreateIndex
CREATE INDEX "DnaReport_email_idx" ON "DnaReport"("email");

-- CreateIndex
CREATE INDEX "DnaReport_createdAt_idx" ON "DnaReport"("createdAt");

-- CreateIndex
CREATE INDEX "CalendarBooking_email_idx" ON "CalendarBooking"("email");

-- CreateIndex
CREATE INDEX "CalendarBooking_start_idx" ON "CalendarBooking"("start");

-- CreateIndex
CREATE INDEX "WhatsappOptInEvent_ghlContactId_idx" ON "WhatsappOptInEvent"("ghlContactId");

-- CreateIndex
CREATE INDEX "Purchase_appSource_product_idx" ON "Purchase"("appSource", "product");

-- CreateIndex
CREATE INDEX "Subscription_appSource_product_idx" ON "Subscription"("appSource", "product");
