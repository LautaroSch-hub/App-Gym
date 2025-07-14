const server = require('./src/app.js');
const { conn } = require('./src/db.js');

const {obtenerUsuario,crearUsuario} = require('./src/pedidos/PedidoApi')
const port= process.env.PORT || 3001;
// Syncing all the models at once.
const {  Usuario } = conn.models;
conn.sync({ force: false }).then(() => {
  server.listen(port,async () => {

     // await cargarDatos() 
    const usuarios = await Usuario.findAll()
    if (!usuarios.length) { 
      console.log("No hay usuarios, creando usuario administrador...");

      // Crear usuario administrador
      await Usuario.create({
        nombre: "Administrador",
        email: "admin@email.com",
        contraseña_hash: "admin",
        admin: true,
        super_admin: true
      });

      console.log("Usuario administrador creado con éxito.");
    }


  console.log(usuarios.length)
    console.log('%s listening at 3001'); // eslint-disable-line no-console
  });
});