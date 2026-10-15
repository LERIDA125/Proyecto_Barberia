const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const routes = require('./routes');
const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// CORS: nunca reflejar cualquier origen cuando se envían credenciales.
// Lista blanca explícita desde CORS_ORIGIN/FRONTEND_URL; si no está definida,
// solo se permite el entorno local (backend 3000 y frontend 3001).
const ORIGENES_POR_DEFECTO = ['http://localhost:3000', 'http://localhost:3001'];
const origenesPermitidos = env.corsOrigins.length > 0 ? env.corsOrigins : ORIGENES_POR_DEFECTO;

app.use(
  cors({
    origin(origen, callback) {
      // Sin header Origin (curl, health checks, server-to-server) no es CORS.
      if (!origen || origenesPermitidos.includes(origen)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
