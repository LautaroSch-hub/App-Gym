const { Usuario, RutinaPersonalizada, Renovacion } = require('../db');
const { info, hoy, addDays, renovar } = require('../utils/membresia');
const { entero, esTrue } = require('../utils/validar');

// Nunca se devuelve el hash; se agrega el estado de la membresía.
const publico = (u) => {
  const j = u.toJSON();
  delete j.contraseña_hash;
  j.membresia = info(u);
  return j;
};

const CON_RUTINAS = [
  {
    model: RutinaPersonalizada,
    attributes: ['id', 'nombre', 'dia', 'imagen_url', 'descripcion'],
  },
];

const esDuplicado = (e) => e.name === 'SequelizeUniqueConstraintError';

exports.obtenerUsuario = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['contraseña_hash'] },
      include: CON_RUTINAS,
      order: [['id', 'ASC']],
    });
    res.status(200).json(usuarios.map(publico));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['contraseña_hash'] },
      include: CON_RUTINAS,
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(publico(usuario));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.crearUsuario = async (req, res) => {
  try {
    const b = req.body || {};
    const nombre = String(b.nombre || '').trim();
    const email = String(b.email || '').trim();
    const clave = String(b['contraseña_hash'] || '');

    if (!nombre || !email || !clave) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }
    if (clave.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'El email no es válido' });
    }
    const edad = entero(b.edad, 1, 120);
    if (edad === null) {
      return res.status(400).json({ error: 'La edad no es válida' });
    }

    const esAdmin = esTrue(b.admin);
    // Los administradores no tienen membresía. Para el resto, 30 días si no se indica otra cosa.
    const dias = esAdmin ? 0 : b.dias_membresia === undefined ? 30 : entero(b.dias_membresia, 0, 3650);
    if (dias === null) {
      return res.status(400).json({ error: 'Los días de membresía deben estar entre 0 y 3650' });
    }

    if (await Usuario.findOne({ where: { email } })) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    if (await Usuario.findOne({ where: { nombre } })) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese nombre' });
    }

    const vence = dias > 0 ? renovar(null, dias) : null;
    // Se arma a mano (no req.body completo) para que nadie pueda crear un super admin.
    const usuario = await Usuario.create({
      nombre,
      email,
      contraseña_hash: clave,
      edad,
      objetivos: String(b.objetivos || ''),
      detalle_medico: String(b.detalle_medico || ''),
      admin: esAdmin,
      super_admin: false,
      membresia_vence: vence,
    });
    if (dias > 0) {
      await Renovacion.create({
        usuarioId: usuario.id,
        dias,
        vence_anterior: null,
        vence_nuevo: vence,
        registrada_por: req.user.nombre,
      });
    }
    res.status(201).json(publico(usuario));
  } catch (error) {
    res.status(400).json({ error: esDuplicado(error) ? 'Ese nombre o email ya está en uso' : error.message });
  }
};

// Cambiar el rol de administrador o los datos básicos de un usuario
exports.actualizarUsuario = async (req, res) => {
  try {
    const u = await Usuario.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (u.super_admin) return res.status(403).json({ error: 'No se puede modificar al super admin' });

    const b = req.body || {};
    const cambios = {};

    if (b.admin !== undefined) {
      const nuevoAdmin = esTrue(b.admin);
      if (!nuevoAdmin && u.id === req.user.id) {
        return res.status(400).json({ error: 'No podés quitarte tu propio rol de administrador' });
      }
      cambios.admin = nuevoAdmin;
    }
    if (b.nombre !== undefined) {
      const nombre = String(b.nombre).trim();
      if (!nombre) return res.status(400).json({ error: 'El nombre no puede estar vacío' });
      cambios.nombre = nombre;
    }
    if (b.email !== undefined) {
      const email = String(b.email).trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'El email no es válido' });
      cambios.email = email;
    }
    if (b.edad !== undefined) {
      const edad = entero(b.edad, 1, 120);
      if (edad === null) return res.status(400).json({ error: 'La edad no es válida' });
      cambios.edad = edad;
    }
    if (b.objetivos !== undefined) cambios.objetivos = String(b.objetivos);
    if (b.detalle_medico !== undefined) cambios.detalle_medico = String(b.detalle_medico);

    await u.update(cambios);
    res.json(publico(u));
  } catch (error) {
    res.status(400).json({ error: esDuplicado(error) ? 'Ese nombre o email ya está en uso' : error.message });
  }
};

exports.eliminarUsuario = async (req, res) => {
  try {
    const u = await Usuario.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (u.super_admin) return res.status(403).json({ error: 'El super admin no se puede eliminar' });
    if (u.id === req.user.id) return res.status(400).json({ error: 'No podés eliminar tu propia cuenta' });
    // Sus rutinas personalizadas se eliminan con él (asistencia, progreso, medidas y renovaciones se borran solas).
    await RutinaPersonalizada.destroy({ where: { usuarioId: u.id } });
    await u.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Un administrador le pone una contraseña nueva a un usuario (no hay recuperación por email)
exports.resetearPassword = async (req, res) => {
  try {
    const nueva = String((req.body || {}).nueva || '');
    if (nueva.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    const u = await Usuario.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (u.super_admin && u.id !== req.user.id) {
      return res.status(403).json({ error: 'La contraseña del super admin solo la puede cambiar él mismo' });
    }
    await u.update({ contraseña_hash: nueva }); // el modelo la hashea
    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Suma `dias` de membresía: sobre lo que le queda si sigue vigente, o desde hoy si ya venció.
exports.renovarMembresia = async (req, res) => {
  try {
    const dias = entero((req.body || {}).dias, 1, 3650);
    if (dias === null) {
      return res.status(400).json({ error: 'Indicá una cantidad de días entre 1 y 3650' });
    }
    const u = await Usuario.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (u.admin || u.super_admin) {
      return res.status(400).json({ error: 'Los administradores no tienen membresía' });
    }

    const anterior = u.membresia_vence || null;
    const nuevo = renovar(anterior, dias);
    await u.update({ membresia_vence: nuevo });
    await Renovacion.create({
      usuarioId: u.id,
      dias,
      vence_anterior: anterior,
      vence_nuevo: nuevo,
      registrada_por: req.user.nombre,
    });
    res.json(publico(u));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Desactiva la membresía de inmediato (se puede volver a activar renovándola)
exports.desactivarMembresia = async (req, res) => {
  try {
    const u = await Usuario.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (u.admin || u.super_admin) {
      return res.status(400).json({ error: 'Los administradores no tienen membresía' });
    }
    const anterior = u.membresia_vence || null;
    const nuevo = addDays(hoy(), -1);
    await u.update({ membresia_vence: nuevo });
    await Renovacion.create({
      usuarioId: u.id,
      dias: 0,
      vence_anterior: anterior,
      vence_nuevo: nuevo,
      registrada_por: req.user.nombre,
    });
    res.json(publico(u));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.obtenerRenovaciones = async (req, res) => {
  try {
    const filas = await Renovacion.findAll({
      where: { usuarioId: req.params.id },
      order: [['id', 'DESC']],
      limit: 100,
    });
    res.json(filas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
