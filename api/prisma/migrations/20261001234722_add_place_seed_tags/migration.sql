-- Semente de curadoria manual do DNA, ponte temporária até Posts (Fase 5)
-- existir de verdade. Ver docs/EMENDA-004-SEED-TAGS-NO-PLACE.md.
ALTER TABLE "places" ADD COLUMN "seed_tags" JSONB;
