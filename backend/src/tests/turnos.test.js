const test = require('node:test');
const assert = require('node:assert');
const turnosService = require('../services/turnos.service');
const prisma = require('../config/prisma');

test('Un cliente solo debe poder acceder a sus propios turnos', async () => {
  const originalFindMany = prisma.turno.findMany;
  prisma.turno.findMany = async ({ where }) => {
    assert.strictEqual(where.clienteId, 'u1');
    return [{ id: 't1', clienteId: 'u1' }];
  };
  const resultado = await turnosService.listar({ usuario: { id: 'u1', rol: 'cliente' }, filtros: {} });
  assert(Array.isArray(resultado));
  prisma.turno.findMany = originalFindMany;
});

test('Un administrador puede acceder a todos los turnos', async () => {
  const originalFindMany = prisma.turno.findMany;
  prisma.turno.findMany = async ({ where }) => {
    return [{ id: 't1', clienteId: 'u1' }, { id: 't2', clienteId: 'u2' }];
  };
  const resultado = await turnosService.listar({ usuario: { id: 'admin1', rol: 'admin' }, filtros: {} });
  assert(Array.isArray(resultado));
  assert.strictEqual(resultado.length, 2);
  prisma.turno.findMany = originalFindMany;
});

test('Un barbero NO puede cancelar el turno de otro barbero (403)', async () => {
  const originalTurnoFindUnique = prisma.turno.findUnique;
  const originalBarberoFindUnique = prisma.barbero.findUnique;

  prisma.turno.findUnique = async () => ({
    id: 't1',
    clienteId: 'u-cliente',
    barberoId: 'b2',
    estado: 'confirmado',
    fechaInicio: new Date(Date.now() + 72 * 3600000),
  });
  // El usuario autenticado es el barbero b1, no el dueño del turno (b2)
  prisma.barbero.findUnique = async () => ({ id: 'b1', usuarioId: 'u-barbero-1' });

  await assert.rejects(
    () => turnosService.cancelar({ id: '11111111-1111-1111-1111-111111111111', usuario: { id: 'u-barbero-1', rol: 'barbero' }, motivo: null }),
    (err) => err.status === 403
  );

  prisma.turno.findUnique = originalTurnoFindUnique;
  prisma.barbero.findUnique = originalBarberoFindUnique;
});

test('Un barbero SÍ puede operar su propio turno (no recibe 403)', async () => {
  const originalTurnoFindUnique = prisma.turno.findUnique;
  const originalBarberoFindUnique = prisma.barbero.findUnique;

  prisma.turno.findUnique = async () => ({
    id: 't1',
    clienteId: 'u-cliente',
    barberoId: 'b1',
    estado: 'cancelado', // fuerza 409 (no 403), demostrando que la autorización pasó
    fechaInicio: new Date(Date.now() + 72 * 3600000),
  });
  prisma.barbero.findUnique = async () => ({ id: 'b1', usuarioId: 'u-barbero-1' });

  await assert.rejects(
    () => turnosService.cancelar({ id: '11111111-1111-1111-1111-111111111111', usuario: { id: 'u-barbero-1', rol: 'barbero' }, motivo: null }),
    (err) => err.status === 409
  );

  prisma.turno.findUnique = originalTurnoFindUnique;
  prisma.barbero.findUnique = originalBarberoFindUnique;
});
