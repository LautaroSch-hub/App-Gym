const { Router } = require('express');
const express = require('express');
const { listarMedidas, crearMedida, eliminarMedida } = require('../pedidos/SeguimientoApi');
const { authenticate, requireAdmin, requireActive } = require('../middlewares/auth');

const router = Router();
router.use(express.json());
router.use(authenticate);

router.get('/usuario/:usuarioId', requireAdmin, listarMedidas); // vista del administrador
router.get('/', requireActive, listarMedidas);
router.post('/', requireActive, crearMedida);
router.delete('/:id', requireActive, eliminarMedida);

module.exports = router;
