const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

// Un hash de bcrypt empieza con $2a$, $2b$ o $2y$ seguido del costo.
const esHash = (s) => /^\$2[aby]\$\d{2}\$/.test(String(s || ""));

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
  // Último día en que puede usar la app (inclusive). Los administradores no la usan.
  membresia_vence: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  },{
    timestamps: false,
    hooks: {
      // La contraseña siempre se guarda hasheada, sin importar desde dónde se cree o cambie.
      beforeCreate: async (u) => {
        if (!esHash(u.contraseña_hash)) u.contraseña_hash = await bcrypt.hash(String(u.contraseña_hash), 10);
      },
      beforeUpdate: async (u) => {
        if (u.changed("contraseña_hash") && !esHash(u.contraseña_hash)) {
          u.contraseña_hash = await bcrypt.hash(String(u.contraseña_hash), 10);
        }
      },
    },
  });
};
