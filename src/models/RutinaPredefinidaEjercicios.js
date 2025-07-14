const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const RutinaPredefinidaEjercicios = sequelize.define("RutinaPredefinidaEjercicios", {
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
    }, {
        timestamps: false
    });

    return RutinaPredefinidaEjercicios;
};