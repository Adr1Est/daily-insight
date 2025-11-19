-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "daily_insight";

-- CreateTable
CREATE TABLE "daily_insight"."Insight" (
    "id" SERIAL NOT NULL,
    "data" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);
