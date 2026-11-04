const { Router} = require('express');
const express = require('express')
const { crearEjercicio,obtenerEjercicios,obtenerEjercicioPorId,actualizarEjercicio,eliminarEjercicio } = require('../pedidos/PedidoApi');
const { authenticate, requireAdmin, requireActive } = require('../middlewares/auth');
const router = Router();
router.use(express.json())
router.use(authenticate)

// Ver ejercicios: cualquier usuario con membresía vigente
router.get('/', requireActive, obtenerEjercicios);
router.get('/:id', requireActive, obtenerEjercicioPorId);

// Crear, modificar y eliminar: solo administradores
router.post('/', requireAdmin, crearEjercicio);
router.put('/:id', requireAdmin, actualizarEjercicio);
router.delete('/:id', requireAdmin, eliminarEjercicio);


module.exports = router;
