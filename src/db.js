require('dotenv').config();
const { Sequelize, Op, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Falta la variable de entorno DATABASE_URL.');
}
const sequelize = new Sequelize(connectionString);

const basename = path.basename(__filename);
const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Inyectamos la conexión (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));

// Capitalizamos los nombres de los modelos i.e., product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// Extraemos los modelos
const { Usuario, Ejercicio, RutinaPersonalizada, RutinaPredefinida, RutinaPredefinidaEjercicios, RutinaPersonalizadaEjercicios, Musculo,RutinaPredefinida_Musculos, Membresia, Renovacion, Asistencia, RegistroProgreso, Medida } = sequelize.models;

// Relaciones existentes
RutinaPredefinida.belongsToMany(Ejercicio, { through: RutinaPredefinidaEjercicios });
Ejercicio.belongsToMany(RutinaPredefinida, { through: RutinaPredefinidaEjercicios });

RutinaPersonalizada.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Usuario.hasMany(RutinaPersonalizada, { foreignKey: 'usuarioId' });

Usuario.hasOne(Membresia);
Membresia.belongsTo(Usuario);

RutinaPersonalizada.belongsToMany(Ejercicio, { through: RutinaPersonalizadaEjercicios });
Ejercicio.belongsToMany(RutinaPersonalizada, { through: RutinaPersonalizadaEjercicios });

// NUEVA RELACIÓN: RutinaPredefinida <-> Musculo (Many-to-Many)
RutinaPredefinida.belongsToMany(Musculo, { through: RutinaPredefinida_Musculos });
Musculo.belongsToMany(RutinaPredefinida, { through: RutinaPredefinida_Musculos });

// Seguimiento del usuario: renovaciones, asistencia, progreso y medidas
const fk = (name) => ({ name, allowNull: false });
Usuario.hasMany(Renovacion, { foreignKey: fk('usuarioId'), onDelete: 'CASCADE' });
Renovacion.belongsTo(Usuario, { foreignKey: fk('usuarioId') });

Usuario.hasMany(Asistencia, { foreignKey: fk('usuarioId'), onDelete: 'CASCADE' });
Asistencia.belongsTo(Usuario, { foreignKey: fk('usuarioId') });

Usuario.hasMany(RegistroProgreso, { foreignKey: fk('usuarioId'), onDelete: 'CASCADE' });
RegistroProgreso.belongsTo(Usuario, { foreignKey: fk('usuarioId') });
Ejercicio.hasMany(RegistroProgreso, { foreignKey: fk('ejercicioId'), onDelete: 'CASCADE' });
RegistroProgreso.belongsTo(Ejercicio, { foreignKey: fk('ejercicioId') });

Usuario.hasMany(Medida, { foreignKey: fk('usuarioId'), onDelete: 'CASCADE' });
Medida.belongsTo(Usuario, { foreignKey: fk('usuarioId') });

const esHash = (s) => /^\$2[aby]\$\d{2}\$/.test(String(s || ''));

// sync() no agrega columnas a tablas que ya existen, así que la columna nueva se agrega acá (una sola vez).
async function asegurarEsquema() {
  const qi = sequelize.getQueryInterface();
  const tabla = Usuario.getTableName();
  const columnas = await qi.describeTable(tabla);
  if (!columnas.membresia_vence) {
    await qi.addColumn(tabla, 'membresia_vence', { type: DataTypes.DATEONLY, allowNull: true });
    // Los usuarios que ya existen arrancan con 30 días para que nadie quede afuera de golpe.
    await sequelize.query(
      `UPDATE "${tabla}" SET membresia_vence = (CURRENT_DATE + 30) WHERE COALESCE(admin, false) = false AND COALESCE(super_admin, false) = false`
    );
    console.log('Se agregó la columna membresia_vence: los usuarios actuales quedaron con 30 días de membresía.');
  }

  // Orden de los ejercicios dentro de cada rutina. Los que ya existen conservan el orden en que se cargaron.
  for (const Through of [RutinaPredefinidaEjercicios, RutinaPersonalizadaEjercicios]) {
    const t = Through.getTableName();
    const nombreTabla = typeof t === 'string' ? t : t.tableName;
    const cols = await qi.describeTable(t);
    if (!cols.orden) {
      await qi.addColumn(t, 'orden', { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 });
      await sequelize.query(`UPDATE "${nombreTabla}" SET orden = id`);
      console.log(`Se agregó la columna orden a ${nombreTabla}.`);
    }
  }
}

// Grupos musculares. "Pierna" se reemplazó por cuatro grupos más específicos.
const MUSCULOS = ['Glúteos', 'Cuádriceps', 'Abductores', 'Isquiotibiales', 'Pecho', 'Espalda', 'Bíceps', 'Tríceps', 'Hombro'];
const MUSCULOS_RENOMBRADOS = { Gluteos: 'Glúteos', Biceps: 'Bíceps', Triceps: 'Tríceps' };

async function asegurarMusculos() {
  // Se corrigen los acentos de los músculos que ya existían
  for (const [viejo, nuevo] of Object.entries(MUSCULOS_RENOMBRADOS)) {
    const m = await Musculo.findOne({ where: { nombre: viejo } });
    if (m && !(await Musculo.findOne({ where: { nombre: nuevo } }))) await m.update({ nombre: nuevo });
  }

  // Pierna ya no existe: se quita de las rutinas que la tenían (hay que asignarles los músculos nuevos)
  const pierna = await Musculo.findOne({ where: { nombre: 'Pierna' } });
  if (pierna) {
    let afectadas = [];
    try {
      // Solo para avisar en el log qué rutinas quedan sin ese músculo; si falla, no frena el arranque
      const filas = await RutinaPredefinida_Musculos.findAll({ where: { MusculoId: pierna.id }, attributes: ['RutinaPredefinidaId'] });
      afectadas = await RutinaPredefinida.findAll({
        attributes: ['id', 'nombre'],
        where: { id: filas.map((f) => f.RutinaPredefinidaId) },
      });
    } catch (e) {
      console.log('No se pudo listar las rutinas que tenían "Pierna":', e.message);
    }
    await RutinaPredefinida_Musculos.destroy({ where: { MusculoId: pierna.id } });
    await pierna.destroy();
    console.log('Se eliminó el músculo "Pierna".');
    if (afectadas.length) {
      console.log(
        'Rutinas generales que tenían "Pierna" y ahora necesitan músculos nuevos: ' +
          afectadas.map((r) => `"${r.nombre}"`).join(', ')
      );
    }
  }

  // Se crean los que falten
  for (const nombre of MUSCULOS) {
    if (!(await Musculo.findOne({ where: { nombre } }))) {
      await Musculo.create({ nombre });
      console.log(`Se agregó el músculo "${nombre}".`);
    }
  }
}

// Las contraseñas que estaban en texto plano se convierten a hash una sola vez.
async function migrarPasswords() {
  const usuarios = await Usuario.findAll({ attributes: ['id', 'contraseña_hash'] });
  let n = 0;
  for (const u of usuarios) {
    if (!esHash(u.contraseña_hash)) {
      u.contraseña_hash = await bcrypt.hash(String(u.contraseña_hash), 10);
      await u.save({ hooks: false });
      n++;
    }
  }
  if (n) console.log(`Se hashearon ${n} contraseñas que estaban en texto plano.`);
}

// El servidor espera a que esto termine antes de empezar a atender pedidos.
const ready = (async () => {
  await sequelize.sync({ force: false });
  await asegurarEsquema();
  await migrarPasswords();
  await asegurarMusculos();
})();
ready.catch((error) => console.error('Error al preparar la base de datos:', error));

module.exports = {
  ...sequelize.models, // Para importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,     // Para importar la conexión: { conn } = require('./db.js');
  ready,               // Promesa que se resuelve cuando la base está lista
};
