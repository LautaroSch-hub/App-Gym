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
    }, {
        timestamps: false
    });

    return RutinaPersonalizadaEjercicios;
};