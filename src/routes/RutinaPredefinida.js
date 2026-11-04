const { Router} = require('express');
const express = require('express')
const { reordenarEjerciciosPredefinida, ModificarRutinaPredefinida,eliminarMusculoDeRutinaGeneral,agregarMusculoARutinaPredefinida,crearRutinaPredefinida,obtenerTodasRutinaPredefinida,obtenerRutinaPredefinida,agregarEjercicioARutinaPredefinida,eliminarRutinaPredefinida,eliminarEjercicioDeRutinaGeneral } = require('../pedidos/PedidoApi');
const { authenticate, requireAdmin, requireActive } = require('../middlewares/auth');
const router = Router();
router.use(express.json())
router.use(authenticate)

// Ver rutinas generales: cualquier usuario con membresía vigente
router.get('/:id', requireActive, obtenerRutinaPredefinida);
router.get('/', requireActive, obtenerTodasRutinaPredefinida);

// Crear y modificar: solo administradores
router.post('/', requireAdmin, crearRutinaPredefinida);
router.put('/:rutinaId/ejercicios/:ejercicioId', requireAdmin, agregarEjercicioARutinaPredefinida);
router.put('/:rutinaId/orden', requireAdmin, reordenarEjerciciosPredefinida); // cambiar el orden de los ejercicios
router.delete('/:rutinaId/ejercicios/:ejercicioId', requireAdmin, eliminarEjercicioDeRutinaGeneral);
router.put('/:rutinaId/musculo/:musculoId', requireAdmin, agregarMusculoARutinaPredefinida);
router.put('/:rutinaId/musculo', requireAdmin, ModificarRutinaPredefinida);

router.delete('/:rutinaId/musculo/:musculoId', requireAdmin, eliminarMusculoDeRutinaGeneral);
router.delete('/:id', requireAdmin, eliminarRutinaPredefinida);


module.exports = router;
