const server = require('./src/app.js');
const { conn, ready } = require('./src/db.js');

const port = process.env.PORT || 3001;
const { Usuario } = conn.models;

// Arranca recién cuando la base está lista (tablas, columnas nuevas y contraseñas hasheadas).
ready
  .then(async () => {
    if (!(await Usuario.count())) {
      console.log('No hay usuarios, creando usuario administrador...');
      await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@email.com',
        contraseña_hash: 'admin', // se guarda hasheada; cambiala después de entrar
        detalle_medico: '',
        objetivos: '',
        edad: 30,
        admin: true,
        super_admin: true,
      });
      console.log('Usuario administrador creado (admin@email.com / admin). Cambiá la contraseña.');
    }

    server.listen(port, () => {
      console.log(`API escuchando en el puerto ${port}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  });
