const { DataTypes } = require('sequelize');

// Lo que el usuario levantó en un ejercicio: peso, repeticiones y series.
module.exports = (sequelize) => {
  sequelize.define(
    'RegistroProgreso',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      fecha: { type: DataTypes.DATEONLY, allowNull: false },
      peso_kg: { type: DataTypes.DOUBLE, allowNull: false },
      repeticiones: { type: DataTypes.INTEGER, allowNull: false },
      series: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    },
    {
      tableName: 'registros_progreso',
      updatedAt: false,
      indexes: [{ fields: ['usuarioId', 'ejercicioId', 'fecha'] }],
    }
  );
};
