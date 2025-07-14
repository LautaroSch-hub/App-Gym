const { DataTypes } = require('sequelize');

    const RutinaPersonalizada = (sequelize) => {
        sequelize.define("RutinaPersonalizada", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    dia: {
      type: DataTypes.ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'),
      allowNull: false,
  },
    descripcion: {
        type: DataTypes.TEXT,
    },
    imagen_url: {
        type: DataTypes.STRING(255),
    },
});
};  
module.exports = RutinaPersonalizada;