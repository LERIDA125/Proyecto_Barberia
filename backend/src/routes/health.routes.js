const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok', servicio: 'barberia-api' });
});

module.exports = router;
