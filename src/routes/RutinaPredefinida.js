const { Router} = require('express');
const express = require('express')
const { ModificarRutinaPredefinida,eliminarMusculoDeRutinaGeneral,agregarMusculoARutinaPredefinida,crearRutinaPredefinida,obtenerTodasRutinaPredefinida,obtenerRutinaPredefinida,agregarEjercicioARutinaPredefinida,eliminarRutinaPredefinida,eliminarEjercicioDeRutinaGeneral } = require('../pedidos/PedidoApi');
//const {Country, Actividad} = require('../db')
const router = Router();
router.use(express.json())
// Crear un nuevo ejercicio
router.post('/', crearRutinaPredefinida);

// Obtener un ejercicio por ID
router.get('/:id', obtenerRutinaPredefinida);
router.get('/', obtenerTodasRutinaPredefinida);

// Actualizar un ejercicio
router.put('/:rutinaId/ejercicios/:ejercicioId', agregarEjercicioARutinaPredefinida);
router.put('/:rutinaId/musculo/:musculoId', agregarMusculoARutinaPredefinida);
router.put('/:rutinaId/musculo', ModificarRutinaPredefinida);

router.delete('/:rutinaId/musculo/:musculoId', eliminarMusculoDeRutinaGeneral);
// Eliminar un ejercicio
router.delete('/:id', eliminarRutinaPredefinida);


module.exports = router;