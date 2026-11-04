const { DataTypes } = require('sequelize');

// Historial de renovaciones de membresía hechas por un administrador.
// dias = 0 significa que la membresía se desactivó a mano.
module.exports = (sequelize) => {
  sequelize.define(
    'Renovacion',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      dias: { type: DataTypes.INTEGER, allowNull: false },
      vence_anterior: { type: DataTypes.DATEONLY, allowNull: true },
      vence_nuevo: { type: DataTypes.DATEONLY, allowNull: false },
      registrada_por: { type: DataTypes.STRING(50), allowNull: true },
    },
    { tableName: 'renovaciones', updatedAt: false }
  );
};
