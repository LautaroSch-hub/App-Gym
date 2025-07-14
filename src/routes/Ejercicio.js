const { Router} = require('express');
const express = require('express')
const { crearEjercicio,obtenerEjercicios,obtenerEjercicioPorId,actualizarEjercicio,eliminarEjercicio } = require('../pedidos/PedidoApi');
//const {Country, Actividad} = require('../db')
const router = Router();
router.use(express.json())
// Crear un nuevo ejercicio
router.post('/', crearEjercicio);

// Obtener todos los ejercicios
router.get('/', obtenerEjercicios);

// Obtener un ejercicio por ID
router.get('/:id', obtenerEjercicioPorId);

// Actualizar un ejercicio
router.put('/:id', actualizarEjercicio);

// Eliminar un ejercicio
router.delete('/:id', eliminarEjercicio);


module.exports = router;