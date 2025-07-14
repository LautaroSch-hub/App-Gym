const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  sequelize.define("Usuario", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
  },
  nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
  },
  email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
  },
  contraseña_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
  },
  detalle_medico: {
      type: DataTypes.TEXT,
      allowNull: false,
  },
  objetivos: {
      type: DataTypes.TEXT,
      allowNull: false,
  },
  edad: {
      type: DataTypes.INTEGER,
      allowNull: false,
  },
  admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },  
  super_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  },{
    timestamps: false,
  });
};  