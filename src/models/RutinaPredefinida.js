const { DataTypes } = require('sequelize');

    const RutinaPredefinida = (sequelize) => {
        sequelize.define("RutinaPredefinida", {
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
    nivel_dificultad: {
        type: DataTypes.ENUM('principiante', 'intermedio', 'avanzado'),
        allowNull: false,
    },
});
}
module.exports = RutinaPredefinida;