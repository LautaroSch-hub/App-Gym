// Lógica de fechas de la membresía.
// Todas las fechas son texto "YYYY-MM-DD" (sin hora) para evitar problemas de zona horaria.
// membresia_vence es el ÚLTIMO día en que el usuario puede usar la app (inclusive).

const ZONA = process.env.GYM_TIMEZONE || 'America/Argentina/Buenos_Aires';

/** Fecha de hoy en la zona horaria del gimnasio, como "YYYY-MM-DD". */
function hoy() {
  return new Date().toLocaleDateString('en-CA', { timeZone: ZONA });
}

function aMs(fecha) {
  const [y, m, d] = String(fecha).split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Suma (o resta) días a una fecha "YYYY-MM-DD". */
function addDays(fecha, dias) {
  const d = new Date(aMs(fecha));
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Diferencia en días entre dos fechas (a - b). */
function diffDays(a, b) {
  return Math.round((aMs(a) - aMs(b)) / 86400000);
}

/**
 * Estado de la membresía de un usuario.
 * Los administradores no tienen membresía (siempre pueden entrar).
 * diasRestantes cuenta los días de acceso que quedan, incluido hoy.
 */
function info(usuario, hoyStr = hoy()) {
  if (usuario.admin || usuario.super_admin) {
    return { exento: true, vigente: true, vence: null, diasRestantes: null, sinMembresia: false, hoy: hoyStr };
  }
  const vence = usuario.membresia_vence || null;
  if (!vence) {
    return { exento: false, vigente: false, vence: null, diasRestantes: 0, sinMembresia: true, hoy: hoyStr };
  }
  const vigente = vence >= hoyStr;
  return {
    exento: false,
    vigente,
    vence,
    diasRestantes: vigente ? diffDays(vence, hoyStr) + 1 : 0,
    sinMembresia: false,
    hoy: hoyStr,
  };
}

/**
 * Nuevo vencimiento al renovar `dias` días.
 * - Si todavía está vigente, los días se suman al vencimiento actual.
 * - Si ya venció (o nunca tuvo), los días cuentan desde hoy.
 */
function renovar(venceActual, dias, hoyStr = hoy()) {
  const ayer = addDays(hoyStr, -1);
  const base = venceActual && venceActual > ayer ? venceActual : ayer;
  return addDays(base, dias);
}

module.exports = { hoy, addDays, diffDays, info, renovar };
