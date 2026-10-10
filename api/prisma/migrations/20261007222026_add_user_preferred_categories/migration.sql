-- Preferência declarada de categoria, sinal de cold start até o DNA do
-- usuário ter histórico real pra se apoiar (Cap. 57).
ALTER TABLE "users" ADD COLUMN "preferred_categories" "PlaceCategory"[] NOT NULL DEFAULT '{}';
