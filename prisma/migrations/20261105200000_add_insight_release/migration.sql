-- AlterTable: lanzamiento del calendario que motivó la curiosidad del día (nulo si no hubo).
ALTER TABLE "daily_insight"."Insight" ADD COLUMN     "releaseGame" TEXT,
ADD COLUMN     "releasePlatform" TEXT,
ADD COLUMN     "releaseYear" INTEGER;
