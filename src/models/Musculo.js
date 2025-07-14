const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define("Musculo", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  });
};
