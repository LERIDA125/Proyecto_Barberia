module.exports = (req, res) => {
  res.status(404).json({ error: true, message: 'Recurso no encontrado' });
};
