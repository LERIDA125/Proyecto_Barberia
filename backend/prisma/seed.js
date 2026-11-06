const prisma = require('../src/config/prisma');

const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';
const OFFSET_ARGENTINA = '-03:00';
const DIA_MS = 24 * 60 * 60 * 1000;

const HORARIO_INICIO = new Date('1970-01-01T10:00:00.000Z');
const HORARIO_FIN = new Date('1970-01-01T20:00:00.000Z');
const DIAS_LABORALES = [1, 2, 3, 4, 5];

const SERVICIOS = [
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

const BARBEROS = [
  {
    nombre: 'Alejandro',
    email: 'alejandro@barberia.com',
    telefono: '+5491100000001',
    especialidad: 'Cortes modernos, degradados (fades) y diseños',
  },
  {
    nombre: 'Marcos',
    email: 'marcos@barberia.com',
    telefono: '+5491100000002',
    especialidad: 'Cortes clásicos, tijera y perfilados de barba a navaja',
  },
];

const CLIENTES = [
  {
    nombre: 'Cliente Prueba',
    email: 'cliente@barberia.com',
    telefono: '+5491199999999',
  },
  {
    nombre: 'Lucas',
    email: 'lucas@barberia.com',
    telefono: '+5491188888888',
  },
];

const TURNOS = [
  {
    clienteEmail: 'cliente@barberia.com',
    barberoEmail: 'alejandro@barberia.com',
    servicioNombre: 'Corte Clásico',
    offsetDias: -7,
    hora: 11,
    estado: 'completado',
    notas: 'Turno de prueba pasado',
  },
  {
    clienteEmail: 'lucas@barberia.com',
    barberoEmail: 'marcos@barberia.com',
    servicioNombre: 'Perfilado de Barba',
    offsetDias: -3,
    hora: 16,
    estado: 'completado',
    notas: 'Turno de prueba pasado',
  },
  {
    clienteEmail: 'cliente@barberia.com',
    barberoEmail: 'marcos@barberia.com',
    servicioNombre: 'Corte Fade / Degradado',
    offsetDias: 3,
    hora: 12,
    estado: 'pendiente',
    notas: 'Turno de prueba futuro',
  },
  {
    clienteEmail: 'lucas@barberia.com',
    barberoEmail: 'alejandro@barberia.com',
    servicioNombre: 'Combo Corte + Barba',
    offsetDias: 7,
    hora: 17,
    estado: 'pendiente',
    notas: 'Turno de prueba futuro',
  },
];

function partesEnZonaHoraria(fecha) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(fecha);

  const valor = (tipo) => Number(partes.find((parte) => parte.type === tipo).value);

  return { year: valor('year'), month: valor('month'), day: valor('day') };
}

function moverADiaHabil(fechaCalendarioUtc) {
  const diaSemana = fechaCalendarioUtc.getUTCDay();

  if (diaSemana === 6) return new Date(fechaCalendarioUtc.getTime() + 2 * DIA_MS);
  if (diaSemana === 0) return new Date(fechaCalendarioUtc.getTime() + DIA_MS);
  return fechaCalendarioUtc;
}

function fechaEnBarberia(offsetDias, hora) {
  const objetivo = new Date(Date.now() + offsetDias * DIA_MS);
  const { year, month, day } = partesEnZonaHoraria(objetivo);
  const diaHabil = moverADiaHabil(new Date(Date.UTC(year, month - 1, day)));

  const fecha = [
    diaHabil.getUTCFullYear(),
    String(diaHabil.getUTCMonth() + 1).padStart(2, '0'),
    String(diaHabil.getUTCDate()).padStart(2, '0'),
  ].join('-');
  const horaFormateada = `${String(hora).padStart(2, '0')}:00:00`;

  return new Date(`${fecha}T${horaFormateada}${OFFSET_ARGENTINA}`);
}

async function limpiarBase(tx) {
  await tx.notificacion.deleteMany();
  await tx.credencialPasskey.deleteMany();
  await tx.turno.deleteMany();
  await tx.bloqueo.deleteMany();
  await tx.barbero.deleteMany();
  await tx.servicio.deleteMany();
  await tx.usuario.deleteMany();
}

async function crearDatos(tx) {
  const admin = await tx.usuario.create({
    data: {
      nombre: 'Admin Barbería',
      email: 'admin@barberia.com',
      telefono: '+5491100000000',
      rol: 'admin',
    },
  });

  const barberos = [];
  for (const data of BARBEROS) {
    const usuario = await tx.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        rol: 'barbero',
      },
    });

    const barbero = await tx.barbero.create({
      data: {
        usuarioId: usuario.id,
        especialidad: data.especialidad,
        horarioInicio: HORARIO_INICIO,
        horarioFin: HORARIO_FIN,
        diasLaborales: DIAS_LABORALES,
      },
    });

    barberos.push({ usuario, barbero });
  }

  const clientes = [];
  for (const data of CLIENTES) {
    const usuario = await tx.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        rol: 'cliente',
      },
    });
    clientes.push(usuario);
  }

  const servicios = [];
  for (const data of SERVICIOS) {
    const servicio = await tx.servicio.create({ data });
    servicios.push(servicio);
  }

  const turnos = [];
  for (const data of TURNOS) {
    const cliente = clientes.find((item) => item.email === data.clienteEmail);
    const barbero = barberos.find((item) => item.usuario.email === data.barberoEmail);
    const servicio = servicios.find((item) => item.nombre === data.servicioNombre);

    if (!cliente || !barbero || !servicio) {
      throw new Error(`Datos incompletos para el turno de ${data.clienteEmail}`);
    }

    const fechaInicio = fechaEnBarberia(data.offsetDias, data.hora);
    const fechaFin = new Date(fechaInicio.getTime() + servicio.duracionMin * 60 * 1000);

    const turno = await tx.turno.create({
      data: {
        clienteId: cliente.id,
        barberoId: barbero.barbero.id,
        servicioId: servicio.id,
        fechaInicio,
        fechaFin,
        estado: data.estado,
        notas: data.notas,
      },
    });
    turnos.push(turno);
  }

  return { admin, barberos, clientes, servicios, turnos };
}

async function main() {
  if (process.env.NODE_ENV !== 'development' && process.env.SEED_FORCE !== 'true') {
    throw new Error(
      'Seed bloqueado: solo se ejecuta con NODE_ENV=development. Usá SEED_FORCE=true solo si es intencional.'
    );
  }

  const resultado = await prisma.$transaction(async (tx) => {
    await limpiarBase(tx);
    return crearDatos(tx);
  });

  console.warn('[seed] Base limpiada y repoblada con datos de desarrollo.');
  console.log('Seed completado:');
  console.log(`- Admin: ${resultado.admin.email}`);
  console.log(`- Barberos: ${resultado.barberos.map((item) => item.usuario.email).join(', ')}`);
  console.log(`- Clientes: ${resultado.clientes.map((item) => item.email).join(', ')}`);
  console.log(`- Servicios: ${resultado.servicios.length}`);
  console.log(
    `- Turnos: ${resultado.turnos.filter((item) => item.estado === 'completado').length} completados (pasados) y ` +
      `${resultado.turnos.filter((item) => item.estado === 'pendiente').length} pendientes (futuros)`
  );
}

main()
  .catch((err) => {
    console.error('Error en el seed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
