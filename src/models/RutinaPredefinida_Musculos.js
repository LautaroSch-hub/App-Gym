const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const RutinaPredefinida_Musculos = sequelize.define("RutinaPredefinida_Musculos", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
    }, {
        timestamps: false
    });

    return RutinaPredefinida_Musculos;
};