// Asistencia, progreso de entrenamiento y medidas corporales.
// Los endpoints "propios" siempre usan el usuario del token (nunca un id que venga del cliente).
// Los de administrador usan /usuario/:usuarioId.
const { Asistencia, RegistroProgreso, Medida, Ejercicio } = require('../db');
const { hoy } = require('../utils/membresia');
const { entero, num, fechaValida } = require('../utils/validar');

const objetivo = (req) => (req.params.usuarioId ? Number(req.params.usuarioId) : req.user.id);

// ---------- Asistencia ----------

exports.listarAsistencia = async (req, res) => {
  try {
    const filas = await Asistencia.findAll({
      where: { usuarioId: objetivo(req) },
      attributes: ['fecha'],
      order: [['fecha', 'DESC']],
      limit: 730,
    });
    const fechas = filas.map((f) => f.fecha);
    const h = hoy();
    res.json({ hoy: h, fechas, marcadoHoy: fechas.includes(h) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Marca la asistencia de hoy. Si ya estaba marcada no hace nada.
exports.marcarAsistencia = async (req, res) => {
  try {
    const fecha = hoy();
    const [, creado] = await Asistencia.findOrCreate({ where: { usuarioId: req.user.id, fecha } });
    res.status(creado ? 201 : 200).json({ fecha, creado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deshacerAsistenciaHoy = async (req, res) => {
  try {
    await Asistencia.destroy({ where: { usuarioId: req.user.id, fecha: hoy() } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ---------- Progreso por ejercicio ----------

exports.listarProgreso = async (req, res) => {
  try {
    const where = { usuarioId: objetivo(req) };
    if (req.query.ejercicioId) {
      const id = entero(req.query.ejercicioId, 1, 2147483647);
      if (id === null) return res.status(400).json({ error: 'ejercicioId no es válido' });
      where.ejercicioId = id;
    }
    const filas = await RegistroProgreso.findAll({
      where,
      include: [{ model: Ejercicio, attributes: ['id', 'nombre'] }],
      order: [
        ['fecha', 'ASC'],
        ['id', 'ASC'],
      ],
      limit: 5000,
    });
    res.json(filas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.crearProgreso = async (req, res) => {
  try {
    const b = req.body || {};
    const ejercicioId = entero(b.ejercicioId, 1, 2147483647);
    if (ejercicioId === null) return res.status(400).json({ error: 'Elegí un ejercicio' });
    if (!(await Ejercicio.findByPk(ejercicioId, { attributes: ['id'] }))) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }

    const peso = num(b.peso_kg, 0, 1000);
    if (peso.vacio || peso.error) return res.status(400).json({ error: 'El peso debe estar entre 0 y 1000 kg' });
    const repeticiones = entero(b.repeticiones, 1, 1000);
    if (repeticiones === null) return res.status(400).json({ error: 'Las repeticiones deben estar entre 1 y 1000' });
    const series = b.series === undefined || b.series === '' ? 1 : entero(b.series, 1, 50);
    if (series === null) return res.status(400).json({ error: 'Las series deben estar entre 1 y 50' });

    const fecha = b.fecha || hoy();
    if (!fechaValida(fecha)) return res.status(400).json({ error: 'La fecha no es válida (no puede ser futura)' });

    const fila = await RegistroProgreso.create({
      usuarioId: req.user.id,
      ejercicioId,
      fecha,
      peso_kg: peso.valor,
      repeticiones,
      series,
    });
    res.status(201).json(fila);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.eliminarProgreso = async (req, res) => {
  try {
    const borrados = await RegistroProgreso.destroy({ where: { id: req.params.id, usuarioId: req.user.id } });
    if (!borrados) return res.status(404).json({ error: 'Registro no encontrado' });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ---------- Medidas corporales ----------

const CAMPOS_MEDIDA = {
  peso_kg: [20, 400],
  grasa_pct: [1, 70],
  cintura_cm: [5, 300],
  pecho_cm: [5, 300],
  cadera_cm: [5, 300],
  brazo_cm: [5, 300],
  muslo_cm: [5, 300],
};

exports.listarMedidas = async (req, res) => {
  try {
    const filas = await Medida.findAll({
      where: { usuarioId: objetivo(req) },
      order: [
        ['fecha', 'ASC'],
        ['id', 'ASC'],
      ],
      limit: 2000,
    });
    res.json(filas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.crearMedida = async (req, res) => {
  try {
    const b = req.body || {};
    const fecha = b.fecha || hoy();
    if (!fechaValida(fecha)) return res.status(400).json({ error: 'La fecha no es válida (no puede ser futura)' });

    const datos = { usuarioId: req.user.id, fecha };
    let alguno = false;
    for (const [campo, [min, max]] of Object.entries(CAMPOS_MEDIDA)) {
      const r = num(b[campo], min, max);
      if (r.error) return res.status(400).json({ error: `El valor de ${campo} debe estar entre ${min} y ${max}` });
      if (!r.vacio) {
        datos[campo] = r.valor;
        alguno = true;
      }
    }
    if (!alguno) return res.status(400).json({ error: 'Cargá al menos una medida' });

    const fila = await Medida.create(datos);
    res.status(201).json(fila);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.eliminarMedida = async (req, res) => {
  try {
    const borrados = await Medida.destroy({ where: { id: req.params.id, usuarioId: req.user.id } });
    if (!borrados) return res.status(404).json({ error: 'Medida no encontrada' });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
