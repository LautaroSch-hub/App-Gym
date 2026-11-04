const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../db');
const { firmarToken } = require('../middlewares/auth');
const { info } = require('../utils/membresia');

// Límite de intentos fallidos de login (en memoria): 8 intentos y se bloquea 10 minutos.
const MAX_INTENTOS = 8;
const BLOQUEO_MS = 10 * 60 * 1000;
const intentos = new Map();

function estaBloqueado(clave) {
  const r = intentos.get(clave);
  if (!r) return false;
  if (r.hasta && r.hasta > Date.now()) return true;
  if (Date.now() - r.ultimo > BLOQUEO_MS) intentos.delete(clave);
  return false;
}

function registrarFallo(clave) {
  const r = intentos.get(clave) || { n: 0 };
  r.n += 1;
  r.ultimo = Date.now();
  if (r.n >= MAX_INTENTOS) {
    r.hasta = Date.now() + BLOQUEO_MS;
    r.n = 0;
  }
  intentos.set(clave, r);
}

const publico = (u) => ({
  id: u.id,
  nombre: u.nombre,
  email: u.email,
  admin: !!u.admin,
  super_admin: !!u.super_admin,
});

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Ingresá tu email y tu contraseña' });
    }

    const clave = `${req.ip}|${String(email).toLowerCase()}`;
    if (estaBloqueado(clave)) {
      return res.status(429).json({ error: 'Demasiados intentos. Probá de nuevo en unos minutos.' });
    }

    const usuario = await Usuario.findOne({ where: { email: String(email).trim() } });
    const ok = usuario && (await bcrypt.compare(String(password), usuario.contraseña_hash));
    if (!ok) {
      registrarFallo(clave);
      return res.status(401).json({ error: 'Usuario o Contraseña incorrecta' });
    }
    intentos.delete(clave);

    const token = firmarToken(usuario);
    const { exp } = jwt.decode(token);
    // Los usuarios con membresía vencida pueden entrar: el front les muestra la pantalla de bloqueo.
    res.json({ token, expiraEn: exp * 1000, usuario: publico(usuario), membresia: info(usuario) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Datos actualizados del usuario logueado (el front lo usa para refrescar la membresía)
exports.me = async (req, res) => {
  res.json({ usuario: publico(req.user), membresia: info(req.user) });
};

exports.cambiarPassword = async (req, res) => {
  try {
    const { actual, nueva } = req.body || {};
    if (!actual || !nueva) {
      return res.status(400).json({ error: 'Completá la contraseña actual y la nueva' });
    }
    if (String(nueva).length < 6) {
      return res.status(400).json({ error: 'La contraseña nueva debe tener al menos 6 caracteres' });
    }
    const usuario = await Usuario.findByPk(req.user.id);
    if (!(await bcrypt.compare(String(actual), usuario.contraseña_hash))) {
      return res.status(400).json({ error: 'La contraseña actual no es correcta' });
    }
    await usuario.update({ contraseña_hash: String(nueva) }); // el modelo la hashea
    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
