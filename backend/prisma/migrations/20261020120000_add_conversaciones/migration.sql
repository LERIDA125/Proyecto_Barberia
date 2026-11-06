CREATE TABLE "conversaciones" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "mensajes" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversaciones_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "conversaciones_usuario_id_updated_at_idx" ON "conversaciones"("usuario_id", "updated_at");

ALTER TABLE "conversaciones"
ADD CONSTRAINT "conversaciones_usuario_id_fkey"
FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
