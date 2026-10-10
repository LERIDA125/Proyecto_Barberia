-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('cliente', 'barbero', 'admin');

-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('pendiente', 'confirmado', 'cancelado', 'completado');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "password_hash" TEXT,
    "rol" "Rol" NOT NULL DEFAULT 'cliente',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barberos" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "especialidad" TEXT,
    "horario_inicio" TIME(0),
    "horario_fin" TIME(0),
    "dias_laborales" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "barberos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "duracion_min" INTEGER NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "barbero_id" TEXT NOT NULL,
    "servicio_id" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoTurno" NOT NULL DEFAULT 'pendiente',
    "notas" TEXT,
    "google_event_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credenciales_passkey" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "credential_id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "transports" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credenciales_passkey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "barberos_usuario_id_key" ON "barberos"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "servicios_nombre_key" ON "servicios"("nombre");

-- CreateIndex
CREATE INDEX "turnos_barbero_id_fecha_inicio_idx" ON "turnos"("barbero_id", "fecha_inicio");

-- CreateIndex
CREATE INDEX "turnos_cliente_id_fecha_inicio_idx" ON "turnos"("cliente_id", "fecha_inicio");

-- CreateIndex
CREATE UNIQUE INDEX "credenciales_passkey_credential_id_key" ON "credenciales_passkey"("credential_id");

-- CreateIndex
CREATE INDEX "credenciales_passkey_usuario_id_idx" ON "credenciales_passkey"("usuario_id");

-- AddForeignKey
ALTER TABLE "barberos" ADD CONSTRAINT "barberos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_barbero_id_fkey" FOREIGN KEY ("barbero_id") REFERENCES "barberos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credenciales_passkey" ADD CONSTRAINT "credenciales_passkey_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
