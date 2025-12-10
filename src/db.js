require('dotenv').config();
const { Sequelize, Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { DB_USER, DB_PASSWORD, DB_HOST } = process.env;


const connectionString = "postgresql://postgres:Macma5caca@db.dvbehyqzgeafufoxgruw.supabase.co:5432/postgres"
const sequelize= new Sequelize(connectionString)

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
const { Usuario, Ejercicio, RutinaPersonalizada, RutinaPredefinida, RutinaPredefinidaEjercicios, RutinaPersonalizadaEjercicios, Musculo,RutinaPredefinida_Musculos, Membresia } = sequelize.models;

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

// Sincronizamos la base de datos y llenamos la tabla Musculo si está vacía
sequelize.sync({ force: false }).then(async () => {
  try {
    const count = await Musculo.count();
    if (count === 0) {
      await Musculo.bulkCreate([
        { nombre: 'Pierna' },
        { nombre: 'Gluteos' },
        { nombre: 'Pecho' },
        { nombre: 'Espalda' },
        { nombre: 'Biceps' },
        { nombre: 'Triceps' },
        { nombre: 'Hombro' },
      ]);
      console.log('Tabla Musculo inicializada correctamente.');
    }
  } catch (error) {
    console.error('Error al inicializar la tabla Musculo:', error);
  }
});

module.exports = {
  ...sequelize.models, // Para importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,     // Para importar la conexión: { conn } = require('./db.js');
};
