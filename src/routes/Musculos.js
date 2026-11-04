const { Router} = require('express');
const express = require('express')
const {obtenerMusculos  } = require('../pedidos/PedidoApi');
const { authenticate, requireActive } = require('../middlewares/auth');
const router = Router();
router.use(express.json())
router.use(authenticate)

// Obtener todos los Musculos
router.get('/', requireActive, obtenerMusculos);


module.exports = router;
