const { DataTypes } = require('sequelize');
const Ejercicio = (sequelize) => {
    sequelize.define("Ejercicio", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
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

module.exports = Ejercicio;