const { Router } = require('express');
const express = require('express');
const U = require('../pedidos/UsuarioApi');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = Router();
router.use(express.json());
// Toda la gestión de usuarios es solo para administradores y super admin
router.use(authenticate, requireAdmin);

router.get('/', U.obtenerUsuario);
router.post('/', U.crearUsuario);
router.get('/:id', U.obtenerUsuarioPorId);
router.put('/:id', U.actualizarUsuario);
router.delete('/:id', U.eliminarUsuario);
router.put('/:id/password', U.resetearPassword);
router.post('/:id/renovar', U.renovarMembresia);
router.post('/:id/desactivar', U.desactivarMembresia);
router.get('/:id/renovaciones', U.obtenerRenovaciones);

module.exports = router;
