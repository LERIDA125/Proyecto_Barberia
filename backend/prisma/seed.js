const prisma = require('../src/config/prisma');

const servicios = [
  {
    nombre: 'Corte Clásico',
    descripcion: 'Corte a tijera o máquina tradicional',
    duracionMin: 30,
    precio: '8000.00',
  },
  {
    nombre: 'Corte Fade / Degradado',
    descripcion: 'Corte degradado moderno',
    duracionMin: 45,
    precio: '10000.00',
  },
  {
    nombre: 'Perfilado de Barba',
    descripcion: 'Incluye toalla caliente y navaja',
    duracionMin: 30,
    precio: '6000.00',
  },
  {
    nombre: 'Combo Corte + Barba',
    descripcion: 'Corte y perfilado de barba',
    duracionMin: 60,
    precio: '14000.00',
  },
];

const barberos = [
  {
    nombre: 'Alejandro',
    email: 'alejandro@barberia.com',
    especialidad: 'Cortes modernos, degradados (fades) y diseños',
    horarioInicio: new Date('1970-01-01T10:00:00.000Z'),
    horarioFin: new Date('1970-01-01T20:00:00.000Z'),
  },
  {
    nombre: 'Marcos',
    email: 'marcos@barberia.com',
    especialidad: 'Cortes clásicos, tijera y perfilados de barba a navaja',
    horarioInicio: new Date('1970-01-01T10:00:00.000Z'),
    horarioFin: new Date('1970-01-01T20:00:00.000Z'),
  },
];

async function main() {
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@barberia.com' },
    update: { nombre: 'Admin Barbería', rol: 'admin', activo: true },
    create: {
      nombre: 'Admin Barbería',
      email: 'admin@barberia.com',
      telefono: '+5491100000000',
      rol: 'admin',
    },
  });

  for (const data of barberos) {
    const usuario = await prisma.usuario.upsert({
      where: { email: data.email },
      update: { nombre: data.nombre, rol: 'barbero', activo: true },
      create: {
        nombre: data.nombre,
        email: data.email,
        rol: 'barbero',
      },
    });

    await prisma.barbero.upsert({
      where: { usuarioId: usuario.id },
      update: {
        especialidad: data.especialidad,
        horarioInicio: data.horarioInicio,
        horarioFin: data.horarioFin,
        diasLaborales: [1, 2, 3, 4, 5, 6],
        activo: true,
      },
      create: {
        usuarioId: usuario.id,
        especialidad: data.especialidad,
        horarioInicio: data.horarioInicio,
        horarioFin: data.horarioFin,
        diasLaborales: [1, 2, 3, 4, 5, 6],
      },
    });
  }

  for (const data of servicios) {
    await prisma.servicio.upsert({
      where: { nombre: data.nombre },
      update: { ...data, activo: true },
      create: data,
    });
  }

  await prisma.usuario.upsert({
    where: { email: 'cliente@barberia.com' },
    update: { nombre: 'Cliente Prueba', rol: 'cliente', activo: true },
    create: {
      nombre: 'Cliente Prueba',
      email: 'cliente@barberia.com',
      telefono: '+5491199999999',
      rol: 'cliente',
    },
  });

  console.log(`Seed completado: 1 admin (${admin.email}), ${barberos.length} barberos, ${servicios.length} servicios, 1 cliente.`);
}

main()
  .catch((err) => {
    console.error('Error en el seed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
