import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const emailDemo = "ferar@ejemplo.com"; // <-- Poné tu email de registro acá

  // 1. Ascender el usuario a Admin
  const usuario = await prisma.usuario.update({
    where: { email: emailDemo },
    data: { rol: "admin" }, // podés poner 'barbero' también
  });

  // 2. Crear su perfil operativo de Barbero (si no existe)
  const barbero = await prisma.barbero.upsert({
    where: { usuarioId: usuario.id },
    update: {}, // Si ya existe, no hace nada
    create: {
      usuarioId: usuario.id,
      especialidad: "Master Barber",
      // Ejemplo: Trabaja de Lunes (1) a Sábado (6)
      diasLaborales: [1, 2, 3, 4, 5, 6],
      // Las fechas en Prisma para horas usan un Date base
      horarioInicio: new Date("1970-01-01T10:00:00Z"),
      horarioFin: new Date("1970-01-01T20:00:00Z"),
    },
  });

  console.log("¡Éxito! Usuario ascendido:", usuario.email);
  console.log("Perfil de Barbero creado con ID:", barbero.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
