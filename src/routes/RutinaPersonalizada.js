const { Router} = require('express');
const express = require('express')
const { reordenarEjerciciosPersonalizada, ModificarRutinaPersonalizada,obtenerRutinaPersonalizadabyID,crearRutinaPersonalizada,obtenerRutinaPersonalizada,agregarEjercicioARutinaPersonalizada,eliminarRutinaPersonalizada,eliminarEjercicioDeRutinaPersonalizada,obtenerTodasRutinaPersonalizada } = require('../pedidos/PedidoApi');
const { authenticate, requireAdmin, requireActive, requireSelfOrAdmin } = require('../middlewares/auth');
const router = Router();
router.use(express.json())
router.use(authenticate)

// Solo administradores: crear, modificar, eliminar y ver todas las rutinas
router.post('/', requireAdmin, crearRutinaPersonalizada);
router.get('/', requireAdmin, obtenerTodasRutinaPersonalizada);

// Una rutina puntual: su dueño (con membresía vigente) o un administrador
router.get('/rutina/:id', requireActive, obtenerRutinaPersonalizadabyID);

// Las rutinas de un usuario: ese usuario (con membresía vigente) o un administrador
router.get('/:usuarioId', requireSelfOrAdmin('usuarioId'), requireActive, obtenerRutinaPersonalizada);

router.put('/:rutinaId/ejercicios/:ejercicioId', requireAdmin, agregarEjercicioARutinaPersonalizada);
router.put('/:rutinaId/orden', requireAdmin, reordenarEjerciciosPersonalizada); // cambiar el orden de los ejercicios
router.delete('/:rutinaId/ejercicios/:ejercicioId', requireAdmin, eliminarEjercicioDeRutinaPersonalizada);

router.put('/:rutinaId/musculo', requireAdmin, ModificarRutinaPersonalizada);
router.delete('/:id', requireAdmin, eliminarRutinaPersonalizada);


module.exports = router;
