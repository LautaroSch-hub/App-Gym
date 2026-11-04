const { DataTypes } = require('sequelize');

// Medidas corporales del usuario en una fecha. Todos los valores son opcionales.
module.exports = (sequelize) => {
  sequelize.define(
    'Medida',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      fecha: { type: DataTypes.DATEONLY, allowNull: false },
      peso_kg: { type: DataTypes.DOUBLE },
      grasa_pct: { type: DataTypes.DOUBLE },
      cintura_cm: { type: DataTypes.DOUBLE },
      pecho_cm: { type: DataTypes.DOUBLE },
      cadera_cm: { type: DataTypes.DOUBLE },
      brazo_cm: { type: DataTypes.DOUBLE },
      muslo_cm: { type: DataTypes.DOUBLE },
    },
    {
      tableName: 'medidas',
      updatedAt: false,
      indexes: [{ fields: ['usuarioId', 'fecha'] }],
    }
  );
};
