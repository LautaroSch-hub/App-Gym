const { hoy, addDays } = require('./membresia');

/** Devuelve el entero si está entre min y max, o null si no es válido. */
function entero(v, min, max) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

/**
 * Número opcional con rango.
 * { vacio: true } si no vino, { error: true } si es inválido, { valor } si está bien.
 */
function num(v, min, max) {
  if (v === undefined || v === null || v === '') return { vacio: true };
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) return { error: true };
  return { valor: n };
}

/** "YYYY-MM-DD" real y que no sea futura. */
function fechaValida(f) {
  return typeof f === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f) && addDays(f, 0) === f && f <= hoy();
}

const esTrue = (v) => v === true || v === 'true';

module.exports = { entero, num, fechaValida, esTrue };
