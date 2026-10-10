module.exports = (req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
};
