const clientesService = require('../services/clientes.service');

async function listarClientes(req, res, next) {
  try {
    const clientes = await clientesService.listarClientes({ limite: req.query.limite });
    res.json(clientes);
  } catch (err) {
    next(err);
  }
}

async function buscarClientes(req, res, next) {
  try {
    const clientes = await clientesService.buscarClientes(req.query.q);
    res.json(clientes);
  } catch (err) {
    next(err);
  }
}

async function obtenerHistorialCliente(req, res, next) {
  try {
    const resultado = await clientesService.obtenerHistorialCliente(req.params.id);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = { listarClientes, buscarClientes, obtenerHistorialCliente };
