const { DataTypes } = require('sequelize');

// Un check-in por usuario y por día.
module.exports = (sequelize) => {
  sequelize.define(
    'Asistencia',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      fecha: { type: DataTypes.DATEONLY, allowNull: false },
    },
    {
      tableName: 'asistencias',
      updatedAt: false,
      indexes: [{ unique: true, fields: ['usuarioId', 'fecha'] }],
    }
  );
};
