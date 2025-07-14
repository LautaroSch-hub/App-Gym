const { Router} = require('express');
const express = require('express')
const {obtenerMusculos  } = require('../pedidos/PedidoApi');
//const {Country, Actividad} = require('../db')
const router = Router();
router.use(express.json())
// Crear un nuevo ejercicio

// Obtener todos los Musculos
router.get('/', obtenerMusculos);


module.exports = router;