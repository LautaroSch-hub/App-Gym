const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const EjercicioMiddelware =require('./Ejercicio')
const UsuarioMiddelware =require('./Usuario')
const RutinaPersonalizadaMiddelware =require('./RutinaPersonalizada')
const RutinaPredefinidaMiddelware =require('./RutinaPredefinida')
const Musculos =require('./Musculos')


const {login } = require('../pedidos/PedidoApi');

const server = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
server.use('/Ejercicio', EjercicioMiddelware);
server.use('/Usuario', UsuarioMiddelware);
server.use('/RutinaPersonalizada', RutinaPersonalizadaMiddelware);
server.use('/RutinaPredefinida', RutinaPredefinidaMiddelware);
server.use('/Musculos', Musculos);

server.get('/', (req, res) => {
  res.send('app');
});
server.post('/login',login);
module.exports = server;
