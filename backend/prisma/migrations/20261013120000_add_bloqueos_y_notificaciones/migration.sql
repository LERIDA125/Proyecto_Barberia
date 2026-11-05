-- AlterEnum
ALTER TYPE "EstadoTurno" ADD VALUE 'ausente';

-- CreateTable
CREATE TABLE "bloqueos" (
    "id" TEXT NOT NULL,
    "barbero_id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,

    CONSTRAINT "bloqueos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bloqueos_barbero_id_inicio_idx" ON "bloqueos"("barbero_id", "inicio");

-- CreateIndex
CREATE INDEX "notificaciones_usuario_id_created_at_idx" ON "notificaciones"("usuario_id", "created_at");

-- AddForeignKey
ALTER TABLE "bloqueos" ADD CONSTRAINT "bloqueos_barbero_id_fkey" FOREIGN KEY ("barbero_id") REFERENCES "barberos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;