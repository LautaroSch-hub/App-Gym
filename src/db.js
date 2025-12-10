require('dotenv').config();
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres:Macma5caca@db.dvbehyqzgeafufoxgruw.supabase.co:5432/postgres";

// 👉 Configuración obligatoria para Supabase + Render (IPv4 + SSL)
const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    }
  }
});

const basename = path.basename(__filename);
const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Inyectamos la conexión (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));

// Capitalizamos nombres de modelos
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map(([name, model]) => [
  name[0].toUpperCase() + name.slice(1), 
  model
]);
sequelize.models = Object.fromEntries(capsEntries);

// Extraemos modelos
const { Usuario, Ejercicio, RutinaPersonalizada, RutinaPredefinida, 
  RutinaPredefinidaEjercicios, RutinaPersonalizadaEjercicios, 
  Musculo, RutinaPredefinida_Musculos, Membresia } = sequelize.models;

// Relaciones existentes
RutinaPredefinida.belongsToMany(Ejercicio, { through: RutinaPredefinidaEjercicios });
Ejercicio.belongsToMany(RutinaPredefinida, { through: RutinaPredefinidaEjercicios });

RutinaPersonalizada.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Usuario.hasMany(RutinaPersonalizada, { foreignKey: 'usuarioId' });

Usuario.hasOne(Membresia);
Membresia.belongsTo(Usuario);

RutinaPersonalizada.belongsToMany(Ejercicio, { through: RutinaPersonalizadaEjercicios });
Ejercicio.belongsToMany(RutinaPersonalizada, { through: RutinaPersonalizadaEjercicios });

// Nueva relación
RutinaPredefinida.belongsToMany(Musculo, { through: RutinaPredefinida_Musculos });
Musculo.belongsToMany(RutinaPredefinida, { through: RutinaPredefinida_Musculos });

// Sincronización
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
  ...sequelize.models,
  conn: sequelize,
};
