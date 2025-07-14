var axios = require('axios')
const { RutinaPredefinida_Musculos, Musculo, Usuario, RutinaPredefinida, RutinaPersonalizada, Ejercicio, RutinaPersonalizadaEjercicios, RutinaPredefinidaEjercicios } = require('../db.js');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario o Contraseña incorrecta" });
        }

        const isMatch = password == usuario.contraseña_hash;
        if (!isMatch) {
            return res.status(401).json({ error: "Usuario o Contraseña incorrecta" });
        }

        // Crear el token
        const token = jwt.sign({ id: usuario.id, email: usuario.email }, "secreto123", { expiresIn: "4h" });

        res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, admin: usuario.admin } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.crearUsuario = async (req, res) => {
    try {
        let { nombre, email, contraseña_hash } = req.body;
        // Verifica que todos los campos requeridos estén presentes
        if (!nombre || !email || !contraseña_hash) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }
        const existingUser = await Usuario.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }

        const usuario = await Usuario.create(req.body);
        res.status(201).json(usuario);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un usuario
exports.eliminarUsuario = async (req, res) => {
    try {
        await Usuario.destroy({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.obtenerUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findAll({
            include: [{
                model: RutinaPersonalizada, // Incluir el modelo RutinaPersonalizada
                attributes: ['id', 'nombre', 'dia', 'imagen_url', 'descripcion'], // Especifica los atributos que deseas obtener
                // Si deseas incluir más detalles de la rutina, puedes agregar más includes aquí
            }]
        });
        res.status(200).json(usuario);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.obtenerUsuarioPorId = async (req, res) => {
    try {
        const usuario1 = await Usuario.findByPk(req.params.id, {
            include: [{
                model: RutinaPersonalizada, // Incluir el modelo RutinaPersonalizada
                attributes: ['id', 'nombre', 'dia', 'imagen_url', 'descripcion'], // Especifica los atributos que deseas obtener
                // Si deseas incluir más detalles de la rutina, puedes agregar más includes aquí
            }]

        });
        if (!usuario1) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario1);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
// Añadir ejercicios a una rutina personalizada

//Ejercicios :
exports.crearEjercicio = async (req, res) => {
    try {
        const ejercicio = await Ejercicio.create(req.body);
        res.status(201).json(ejercicio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los ejercicios
exports.obtenerEjercicios = async (req, res) => {
    try {
        const ejercicios = await Ejercicio.findAll({});
        res.status(200).json(ejercicios);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener un ejercicio por ID
exports.obtenerEjercicioPorId = async (req, res) => {
    try {
        const ejercicio = await Ejercicio.findByPk(req.params.id);
        if (!ejercicio) {
            return res.status(404).json({ error: 'Ejercicio no encontrado' });
        }
        res.status(200).json(ejercicio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar un ejercicio
exports.actualizarEjercicio = async (req, res) => {
    try {
        const ejercicio = await Ejercicio.findByPk(req.params.id);
        if (!ejercicio) {
            return res.status(404).json({ error: 'Ejercicio no encontrado' });
        }
        await ejercicio.update(req.body);
        res.status(200).json(ejercicio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.crearRutinaPersonalizada = async (req, res) => {
    try {
        const rutina = await RutinaPersonalizada.create({
            ...req.body, // Aquí se incluye el usuarioId del cuerpo de la solicitud
        });
        res.status(201).json(rutina);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.obtenerRutinaPersonalizada = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const rutina = await RutinaPersonalizada.findAll({
            where: { usuarioId },
            include: [{
                model: Ejercicio, // Incluir el modelo Ejercicio
                through: {
                    attributes: ['series', 'repeticiones', 'notas'], // Atributos de la tabla intermedia
                },
            }],
        });
        res.status(200).json(rutina);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.obtenerRutinaPersonalizadabyID = async (req, res) => {
    try {
        const rutina = await RutinaPersonalizada.findByPk(req.params.id, {
            include: [{
                model: Ejercicio, // Incluir el modelo Ejercicio
                through: {
                    attributes: ['series', 'repeticiones', 'notas'], // Atributos de la tabla intermedia
                },
            }],
        });
        res.status(200).json(rutina);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.obtenerTodasRutinaPersonalizada = async (req, res) => {
    try {
        const rutina = await RutinaPersonalizada.findAll({
            include: [{
                model: Ejercicio, // Incluir el modelo Ejercicio
                through: {
                    attributes: ['series', 'repeticiones', 'notas'], // Atributos de la tabla intermedia
                },
            }],
        });
        res.status(200).json(rutina);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.eliminarRutinaPersonalizada = async (req, res) => {
    try {
        const rutina = await RutinaPersonalizada.findByPk(req.params.id);
        if (!rutina) {
            return res.status(404).json({ error: 'Rutina personalizada no encontrada' });
        }

        await rutina.destroy(); // Elimina la rutina personalizada
        res.status(204).send(); // Respuesta exitosa sin contenido
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.eliminarEjercicioDeRutinaPersonalizada = async (req, res) => {
    try {
        const { rutinaId, ejercicioId } = req.params;
        console.log(rutinaId)
        console.log(ejercicioId)
        // Buscar la relación en la tabla intermedia y eliminarla
        const deleted = await RutinaPersonalizadaEjercicios.destroy({
            where: { RutinaPersonalizadaId: rutinaId, EjercicioId: ejercicioId }
        });
        // Buscar y eliminar la relación en la tabla intermedia
        if (!deleted) {
            return res.status(404).json({ error: "El ejercicio no está en la rutina personalizada" });
        }

        res.status(200).json({ message: "Ejercicio eliminado de la rutina personalizada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.agregarEjercicioARutinaPersonalizada = async (req, res) => {
    try {
        const rutina = await RutinaPersonalizada.findByPk(req.params.rutinaId);
        const ejercicio = await Ejercicio.findByPk(req.params.ejercicioId);
        console.log("agregarEjercicioARutinaPersonalizada")
        console.log(req.body)
        if (!rutina || !ejercicio) {
            return res.status(404).json({ error: 'Rutina o ejercicio no encontrado' });
        }

        await rutina.addEjercicio(ejercicio, {
            through: { // Día de la semana (Lunes, Martes, etc.)
                series: req.body.series, // Número de series
                repeticiones: req.body.repeticiones // Número de repeticiones
            }
        });

        res.status(200).json({ message: 'Ejercicio agregado a la rutina personalizada' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
// Eliminar un ejercicio
exports.eliminarEjercicio = async (req, res) => {
    try {
        const ejercicio = await Ejercicio.findByPk(req.params.id);
        if (!ejercicio) {
            return res.status(404).json({ error: 'Ejercicio no encontrado' });
        }
        await ejercicio.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
// rutina predefinida 
exports.crearRutinaPredefinida = async (req, res) => {
    try {

        const rutina = await RutinaPredefinida.create(req.body);
        res.status(201).json(rutina);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Agregar un ejercicio a una rutina predefinida
exports.agregarEjercicioARutinaPredefinida = async (req, res) => {
    try {
        const rutina = await RutinaPredefinida.findByPk(req.params.rutinaId);
        const ejercicio = await Ejercicio.findByPk(req.params.ejercicioId);

        if (!rutina || !ejercicio) {
            return res.status(404).json({ error: 'Rutina o ejercicio no encontrado' });
        }
        await rutina.addEjercicio(ejercicio, { through: { series: parseInt(req.body.series), repeticiones: req.body.repeticiones } });
        res.status(200).json({ message: 'Ejercicio agregado a la rutina predefinida' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener una rutina predefinida con sus ejercicios
exports.obtenerRutinaPredefinida = async (req, res) => {
    try {
        const rutina = await RutinaPredefinida.findByPk(req.params.id, {
            include: [
                {
                    model: Ejercicio,
                    through: {
                        attributes: ['series', 'repeticiones']
                    }
                },
                { model: Musculo }
            ],
        });
        if (!rutina) {
            return res.status(404).json({ error: 'Rutina predefinida no encontrada' });
        }
        res.status(200).json(rutina);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.eliminarRutinaPredefinida = async (req, res) => {
    try {
        const rutina = await RutinaPredefinida.findByPk(req.params.id);
        if (!rutina) {
            return res.status(404).json({ error: 'Rutina Predefinida no encontrada' });
        }

        await rutina.destroy(); // Elimina la rutina personalizada
        res.status(204).send(); // Respuesta exitosa sin contenido
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.eliminarEjercicioDeRutinaGeneral = async (req, res) => {
    try {
        const { rutinaId, ejercicioId } = req.params;
        // Buscar y eliminar la relación en la tabla intermedia
        const deleted = await RutinaPredefinidaEjercicios.destroy({
            where: { RutinaPredefinidaId: rutinaId, EjercicioId: ejercicioId }
        });

        if (!deleted) {
            return res.status(404).json({ error: "El ejercicio no está en la rutina general" });
        }

        res.status(200).json({ message: "Ejercicio eliminado de la rutina general" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.obtenerTodasRutinaPredefinida = async (req, res) => {
    try {
        const rutinaPredefinida = await RutinaPredefinida.findAll({
            include: [
                {
                    model: Ejercicio,
                    through: {
                        attributes: ['series', 'repeticiones']
                    }
                },
                { model: Musculo }
            ],
        });
        res.status(200).json(rutinaPredefinida);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.obtenerMusculos = async (req, res) => {
    try {
        const musculos = await Musculo.findAll();
        res.json(musculos);
    } catch (error) {
        console.error('Error al obtener los músculos:', error);
        res.status(500).json({ error: 'Error al obtener los músculos' });
    }
};
exports.agregarMusculoARutinaPredefinida = async (req, res) => {
    try {
        const rutina = await RutinaPredefinida.findByPk(req.params.rutinaId);
        const musculos = await Musculo.findByPk(req.params.musculoId);
        // Buscamos la rutina predefinida
        if (!rutina || !musculos) {
            return res.status(404).json({ error: 'Rutina o musculos no encontrado' });
        }

        // Agregamos la asociación con los músculos seleccionados
        // Sequelize genera automáticamente el método addMusculos por la relación many-to-many
        await rutina.addMusculos(musculos);

        res.json({ message: 'Músculos agregados correctamente a la rutina predefinida.' });
    } catch (error) {
        console.error('Error al agregar músculos a la rutina predefinida:', error);
        res.status(500).json({ error: 'Error al agregar músculos a la rutina predefinida.' });
    }
};
exports.ModificarRutinaPredefinida= async (req, res) => {
    try {
        const rutina = await RutinaPredefinida.findByPk(req.params.rutinaId);
        const { Nombre,Descripcion,imagen } = req.body;
        const nombre =Nombre
        const   descripcion=Descripcion
        const   imagen_url=imagen
        if (!rutina) {
            return res.status(404).json({ error: 'Rutina o musculos no encontrado' });
        }
        await rutina.update({
            nombre,
            descripcion,
            imagen_url
        });
        res.status(200).json({ message: "Rutina modificada correctamente" });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.ModificarRutinaPersonalizada= async (req, res) => {
    try {
        const rutina = await RutinaPersonalizada.findByPk(req.params.rutinaId);
        const { Nombre,Descripcion,imagen,dia } = req.body;
        const nombre =Nombre
        const   descripcion=Descripcion
        const   imagen_url=imagen
        if (!rutina) {
            return res.status(404).json({ error: 'Rutina o musculos no encontrado' });
        }
        await rutina.update({
            nombre,
            descripcion,
            imagen_url,
            dia
        });
        res.status(200).json({ message: "Rutina modificada correctamente" });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.eliminarMusculoDeRutinaGeneral = async (req, res) => {
    try {
        const { rutinaId, musculoId } = req.params;
        // Buscar y eliminar la relación en la tabla intermedia
        const deleted = await RutinaPredefinida_Musculos.destroy({
            where: { RutinaPredefinidaId: rutinaId, MusculoId: musculoId }
        });

        if (!deleted) {
            return res.status(404).json({ error: "El ejercicio no está en la rutina general" });
        }

        res.status(200).json({ message: "Ejercicio eliminado de la rutina general" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

};