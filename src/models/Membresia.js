const { DataTypes } = require('sequelize');
const Membresia = (sequelize) => {
    sequelize.define("Membresia", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      lastPaymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    }, {
      timestamps: false,
    });
  };
  

module.exports = Membresia;