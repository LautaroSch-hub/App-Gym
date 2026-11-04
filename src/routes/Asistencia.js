const { Router } = require('express');
const express = require('express');
const { listarAsistencia, marcarAsistencia, deshacerAsistenciaHoy } = require('../pedidos/SeguimientoApi');
const { authenticate, requireAdmin, requireActive } = require('../middlewares/auth');

const router = Router();
router.use(express.json());
router.use(authenticate);

router.get('/usuario/:usuarioId', requireAdmin, listarAsistencia); // vista del administrador
router.get('/', requireActive, listarAsistencia);
router.post('/', requireActive, marcarAsistencia);
router.delete('/hoy', requireActive, deshacerAsistenciaHoy);

module.exports = router;
