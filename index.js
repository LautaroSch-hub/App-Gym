const server = require('./src/app.js');
const { ready } = require('./src/db.js');

const port = process.env.PORT || 3001;

// Arranca recién cuando la base está lista (tablas, columnas nuevas y contraseñas hasheadas).
ready
  .then(() => {
    server.listen(port, () => {
      console.log(`API escuchando en el puerto ${port}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  });
