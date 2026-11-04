const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const RutinaPersonalizadaEjercicios = sequelize.define("RutinaPersonalizadaEjercicios", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        series: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        repeticiones: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        notas: {
            type: DataTypes.TEXT,
        },
        // Posición del ejercicio dentro de la rutina (1 = primero)
        orden: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        timestamps: false
    });

    return RutinaPersonalizadaEjercicios;
};
