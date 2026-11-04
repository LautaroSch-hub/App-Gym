const { Router } = require('express');
const EjercicioMiddelware =require('./Ejercicio')
const UsuarioMiddelware =require('./Usuario')
const RutinaPersonalizadaMiddelware =require('./RutinaPersonalizada')
const RutinaPredefinidaMiddelware =require('./RutinaPredefinida')
const Musculos =require('./Musculos')
const Asistencia = require('./Asistencia')
const Progreso = require('./Progreso')
const Medidas = require('./Medidas')

const { login, me, cambiarPassword } = require('../pedidos/AuthApi');
const { authenticate } = require('../middlewares/auth');

const server = Router();

server.use('/Ejercicio', EjercicioMiddelware);
server.use('/Usuario', UsuarioMiddelware);
server.use('/RutinaPersonalizada', RutinaPersonalizadaMiddelware);
server.use('/RutinaPredefinida', RutinaPredefinidaMiddelware);
server.use('/Musculos', Musculos);
server.use('/Asistencia', Asistencia);
server.use('/Progreso', Progreso);
server.use('/Medidas', Medidas);

server.get('/', (req, res) => {
  res.send('app');
});

// Sesión
server.post('/login', login);
server.get('/me', authenticate, me); // no exige membresía vigente: sirve para saber si venció
server.put('/me/password', authenticate, cambiarPassword);

module.exports = server;
