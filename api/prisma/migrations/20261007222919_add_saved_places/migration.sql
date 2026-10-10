-- "Quero ir" / "já fui" / favorito — Cap. 22, corte simples (sem Agenda).
-- place_id é texto solto, sem FK: ver comentário do modelo SavedPlace em
-- schema.prisma.
CREATE TYPE "SavedPlaceKind" AS ENUM ('favorito', 'quero', 'vivido');

CREATE TABLE "saved_places" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "place_id" TEXT NOT NULL,
    "kind" "SavedPlaceKind" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_places_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "saved_places_user_id_idx" ON "saved_places"("user_id");

CREATE UNIQUE INDEX "saved_places_user_id_place_id_kind_key" ON "saved_places"("user_id", "place_id", "kind");

ALTER TABLE "saved_places" ADD CONSTRAINT "saved_places_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
