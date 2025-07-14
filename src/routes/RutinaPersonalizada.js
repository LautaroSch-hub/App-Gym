const { Router} = require('express');
const express = require('express')
const { ModificarRutinaPersonalizada,obtenerRutinaPersonalizadabyID,crearRutinaPersonalizada,obtenerRutinaPersonalizada,agregarEjercicioARutinaPersonalizada,eliminarRutinaPersonalizada,eliminarEjercicioDeRutinaPersonalizada,obtenerTodasRutinaPersonalizada } = require('../pedidos/PedidoApi');
//const {Country, Actividad} = require('../db')
const router = Router();
router.use(express.json())
// Crear un nuevo ejercicio
router.post('/', crearRutinaPersonalizada);

// Obtener todos los ejercicios
router.get('/', obtenerTodasRutinaPersonalizada);
router.get('/rutina/:id', obtenerRutinaPersonalizadabyID);

// Obtener un ejercicio por ID
router.get('/:usuarioId', obtenerRutinaPersonalizada);

// Actualizar un ejercicio
router.put('/:rutinaId/ejercicios/:ejercicioId', agregarEjercicioARutinaPersonalizada);
router.delete('/:rutinaId/ejercicios/:ejercicioId', eliminarEjercicioDeRutinaPersonalizada);

router.put('/:rutinaId/musculo', ModificarRutinaPersonalizada);
// Eliminar un ejercicio 
router.delete('/:id', eliminarRutinaPersonalizada);


module.exports = router;