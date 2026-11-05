-- AlterTable: los bugs ya publicados quedan como «bug».
ALTER TABLE "daily_insight"."Insight" ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'bug';

-- Añadido a mano: Prisma no genera CHECK. Debe coincidir con KINDS de lib/insights/kinds.ts.
ALTER TABLE "daily_insight"."Insight" ADD CONSTRAINT "Insight_kind_check" CHECK ("kind" IN ('bug', 'secreto', 'desarrollo', 'descartado', 'localizacion'));
