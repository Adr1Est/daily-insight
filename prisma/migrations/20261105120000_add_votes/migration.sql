-- AlterTable
ALTER TABLE "daily_insight"."Insight" ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "daily_insight"."Vote" (
    "insightId" INTEGER NOT NULL,
    "voterId" UUID NOT NULL,
    "value" SMALLINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("insightId","voterId"),
    -- Añadido a mano: Prisma no genera CHECK.
    CONSTRAINT "Vote_value_check" CHECK ("value" IN (1, -1))
);

-- AddForeignKey
ALTER TABLE "daily_insight"."Vote" ADD CONSTRAINT "Vote_insightId_fkey" FOREIGN KEY ("insightId") REFERENCES "daily_insight"."Insight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
