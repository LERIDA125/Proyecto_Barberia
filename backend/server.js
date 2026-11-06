require("dotenv").config();
const app = require("./src/app");
const { port } = require("./src/config/env");

// Solo escucha en un puerto fijo si estamos en desarrollo local
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Servidor de barberia escuchando en el puerto ${port}`);
  });
}

// Exportamos la app para que Vercel la ejecute como Serverless Function
module.exports = app;
