const { Router } = require('express');
const express = require('express');
const { listarProgreso, crearProgreso, eliminarProgreso } = require('../pedidos/SeguimientoApi');
const { authenticate, requireAdmin, requireActive } = require('../middlewares/auth');

const router = Router();
router.use(express.json());
router.use(authenticate);

router.get('/usuario/:usuarioId', requireAdmin, listarProgreso); // vista del administrador
router.get('/', requireActive, listarProgreso);
router.post('/', requireActive, crearProgreso);
router.delete('/:id', requireActive, eliminarProgreso);

module.exports = router;
