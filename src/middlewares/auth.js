require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Usuario } = require('../db');
const { info } = require('../utils/membresia');

const SECRET = process.env.JWT_SECRET;
if (!SECRET || SECRET.length < 16) {
  throw new Error(
    'Falta la variable de entorno JWT_SECRET (mínimo 16 caracteres). ' +
      'Definila en Render (Environment) o en tu archivo .env antes de iniciar el servidor.'
  );
}

// La sesión dura 3 días desde el login; después hay que volver a ingresar.
const SESION = '3d';

function firmarToken(usuario) {
  return jwt.sign({ id: usuario.id }, SECRET, { expiresIn: SESION });
}

/** Verifica el token y carga el usuario real desde la base en cada pedido. */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Tenés que iniciar sesión.', code: 'NO_TOKEN' });
    }

    let payload;
    try {
      payload = jwt.verify(token, SECRET);
    } catch (e) {
      const vencio = e.name === 'TokenExpiredError';
      return res.status(401).json({
        error: vencio ? 'Tu sesión venció. Volvé a ingresar.' : 'Sesión inválida. Volvé a ingresar.',
        code: vencio ? 'SESSION_EXPIRED' : 'INVALID_TOKEN',
      });
    }

    const user = await Usuario.findByPk(payload.id, {
      attributes: ['id', 'nombre', 'email', 'admin', 'super_admin', 'membresia_vence'],
    });
    if (!user) {
      return res.status(401).json({ error: 'Sesión inválida. Volvé a ingresar.', code: 'INVALID_TOKEN' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

const esAdmin = (u) => !!(u.admin || u.super_admin);

/** Solo administradores y super admin. */
function requireAdmin(req, res, next) {
  if (!esAdmin(req.user)) {
    return res.status(403).json({ error: 'No tenés permisos para hacer esto.', code: 'FORBIDDEN' });
  }
  next();
}

/** Solo usuarios con membresía vigente (los administradores siempre pasan). */
function requireActive(req, res, next) {
  if (!info(req.user).vigente) {
    return res.status(403).json({ error: 'Tu membresía venció. Pedí la renovación al gimnasio.', code: 'MEMBERSHIP_EXPIRED' });
  }
  next();
}

/** El propio usuario o un administrador. `param` es el nombre del parámetro de la ruta con el id. */
function requireSelfOrAdmin(param) {
  return (req, res, next) => {
    if (esAdmin(req.user) || String(req.user.id) === String(req.params[param])) return next();
    res.status(403).json({ error: 'No tenés permisos para ver esto.', code: 'FORBIDDEN' });
  };
}

module.exports = { firmarToken, authenticate, requireAdmin, requireActive, requireSelfOrAdmin };
