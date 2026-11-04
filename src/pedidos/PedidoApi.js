var axios = require('axios')
const { RutinaPredefinida_Musculos, Musculo, Usuario, RutinaPredefinida, RutinaPersonalizada, Ejercicio, RutinaPersonalizadaEjercicios, RutinaPredefinidaEjercicios } = require('../db.js');

// ---------- Orden de los ejercicios dentro de una rutina ----------

const throughDe = (e) => e.RutinaPredefinidaEjercicios || e.RutinaPersonalizadaEjercicios || {};

/** Devuelve la rutina como objeto plano, con sus ejercicios según el campo `orden`. */
function conEjerciciosOrdenados(rutina) {
    const r = rutina && rutina.toJSON ? rutina.toJSON() : rutina;
    if (r && Array.isArray(r.Ejercicios)) {
        r.Ejercicios.sort((a, b) => (throughDe(a).orden || 0) - (throughDe(b).orden || 0) || a.id - b.id);
    }
    return r;
}

/** Posición que le toca a un ejercicio nuevo: al final de la rutina. */
async function siguienteOrden(Through, fk, rutinaId) {
    const max = await Through.max('orden', { where: { [fk]: rutinaId } });
    return (Number.isFinite(max) ? max : 0) + 1;
}

/**
 * Guarda un nuevo orden. El body trae { ejercicios: [id, id, ...] } con TODOS los
 * ejercicios de la rutina en el orden deseado.
 */
async function reordenar(req, res, { Rutina, Through, fk }) {
    try {
        const rutina = await Rutina.findByPk(req.params.rutinaId);
        if (!rutina) return res.status(404).json({ error: 'Rutina no encontrada' });

        const lista = req.body && req.body.ejercicios;
        const nuevos = Array.isArray(lista) ? lista.map(Number) : null;
        if (!nuevos || nuevos.some((n) => !Number.isInteger(n)) || new Set(nuevos).size !== nuevos.length) {
            return res.status(400).json({ error: 'Mandá la lista de ids de ejercicios, sin repetidos' });
        }

        const filas = await Through.findAll({ where: { [fk]: rutina.id }, attributes: ['EjercicioId'] });
        const actuales = filas.map((f) => f.EjercicioId);
        if (nuevos.length !== actuales.length || !nuevos.every((id) => actuales.includes(id))) {
            return res.status(400).json({ error: 'La lista no coincide con los ejercicios de la rutina. Actualizá la pantalla e intentá de nuevo.' });
        }

        await Through.sequelize.transaction(async (t) => {
            for (let i = 0; i < nuevos.length; i++) {
                await Through.update({ orden: i + 1 }, { where: { [fk]: rutina.id, EjercicioId: nuevos[i] }, transaction: t });
            }
        });
        res.status(200).json({ message: 'Orden actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.reordenarEjerciciosPredefinida = (req, res) =>
    reordenar(req, res, { Rutina: RutinaPredefinida, Through: RutinaPredefinidaEjercicios, fk: 'RutinaPredefinidaId' });
exports.reordenarEjerciciosPersonalizada = (req, res) =>
    reordenar(req, res, { Rutina: RutinaPersonalizada, Through: RutinaPersonalizadaEjercicios, fk: 'RutinaPersonalizadaId' });

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
                    attributes: ['series', 'repeticiones', 'notas', 'orden'], // Atributos de la tabla intermedia
                },
            }],
        });
        res.status(200).json(rutina.map(conEjerciciosOrdenados));
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
                    attributes: ['series', 'repeticiones', 'notas', 'orden'], // Atributos de la tabla intermedia
                },
            }],
        });
        if (!rutina) {
            return res.status(404).json({ error: 'Rutina personalizada no encontrada' });
        }
        // Un usuario solo puede ver sus propias rutinas; los administradores ven todas
        if (!(req.user.admin || req.user.super_admin) && rutina.usuarioId !== req.user.id) {
            return res.status(403).json({ error: 'Esa rutina no es tuya' });
        }
        res.status(200).json(conEjerciciosOrdenados(rutina));
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
                    attributes: ['series', 'repeticiones', 'notas', 'orden'], // Atributos de la tabla intermedia
                },
            }],
        });
        res.status(200).json(rutina.map(conEjerciciosOrdenados));
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

        const through = {
            series: req.body.series, // Número de series
            repeticiones: req.body.repeticiones // Número de repeticiones
        };
        // Un ejercicio nuevo va al final; si ya estaba, se conserva su posición
        const ya = await RutinaPersonalizadaEjercicios.findOne({
            where: { RutinaPersonalizadaId: rutina.id, EjercicioId: ejercicio.id }
        });
        if (!ya) through.orden = await siguienteOrden(RutinaPersonalizadaEjercicios, 'RutinaPersonalizadaId', rutina.id);
        await rutina.addEjercicio(ejercicio, { through });

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
        const through = { series: parseInt(req.body.series), repeticiones: req.body.repeticiones };
        // Un ejercicio nuevo va al final; si ya estaba, se conserva su posición
        const ya = await RutinaPredefinidaEjercicios.findOne({
            where: { RutinaPredefinidaId: rutina.id, EjercicioId: ejercicio.id }
        });
        if (!ya) through.orden = await siguienteOrden(RutinaPredefinidaEjercicios, 'RutinaPredefinidaId', rutina.id);
        await rutina.addEjercicio(ejercicio, { through });
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
                        attributes: ['series', 'repeticiones', 'orden']
                    }
                },
                { model: Musculo }
            ],
        });
        if (!rutina) {
            return res.status(404).json({ error: 'Rutina predefinida no encontrada' });
        }
        res.status(200).json(conEjerciciosOrdenados(rutina));
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
                        attributes: ['series', 'repeticiones', 'orden']
                    }
                },
                { model: Musculo }
            ],
        });
        res.status(200).json(rutinaPredefinida.map(conEjerciciosOrdenados));
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
        const { Nombre,Descripcion,imagen,nivel_dificultad } = req.body;
        const nombre =Nombre
        const   descripcion=Descripcion
        const   imagen_url=imagen
        if (!rutina) {
            return res.status(404).json({ error: 'Rutina o musculos no encontrado' });
        }
        const niveles = ['principiante', 'intermedio', 'avanzado'];
        if (nivel_dificultad !== undefined && !niveles.includes(nivel_dificultad)) {
            return res.status(400).json({ error: 'La dificultad no es válida' });
        }
        await rutina.update({
            nombre,
            descripcion,
            imagen_url,
            ...(nivel_dificultad && { nivel_dificultad }) // ahora también se puede cambiar la dificultad
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