require('dotenv').config();
const app = require('./src/app');
const { port } = require('./src/config/env');

app.listen(port, () => {
  console.log(`Servidor de barberia escuchando en el puerto ${port}`);
});
