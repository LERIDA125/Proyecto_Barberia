function serializarTurno(turno) {
  const salida = {
    id: turno.id,
    clienteId: turno.clienteId,
    barberoId: turno.barberoId,
    servicioId: turno.servicioId,
    fechaInicio: turno.fechaInicio,
    fechaFin: turno.fechaFin,
    estado: turno.estado,
    notas: turno.notas,
    googleEventId: turno.googleEventId,
    createdAt: turno.createdAt,
  };

  if (turno.servicio) {
    salida.servicio = {
      id: turno.servicio.id,
      nombre: turno.servicio.nombre,
      duracionMin: turno.servicio.duracionMin,
      precio: Number(turno.servicio.precio),
    };
  }
  if (turno.barbero && turno.barbero.usuario) {
    salida.barbero = { id: turno.barbero.id, nombre: turno.barbero.usuario.nombre };
  }
  if (turno.cliente) {
    salida.cliente = {
      id: turno.cliente.id,
      nombre: turno.cliente.nombre,
      email: turno.cliente.email,
      telefono: turno.cliente.telefono ?? null,
    };
  }

  return salida;
}

module.exports = { serializarTurno };
