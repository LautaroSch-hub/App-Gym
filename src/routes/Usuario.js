const { Router} = require('express');
const express = require('express')
const { obtenerUsuario,obtenerUsuarioPorId,crearUsuario,eliminarUsuario } = require('../pedidos/PedidoApi');
const router = Router();
router.use(express.json())

router.get('/:id', obtenerUsuarioPorId);
router.get('/', obtenerUsuario);
router.post('/', crearUsuario);
router.delete('/:id',eliminarUsuario)
module.exports = router;