const { DataTypes } = require("sequelize");
const db = require("../config/Database.js");

const Slider = db.define(
  "slider",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    gambar: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: true, 
  }
);

module.exports = Slider;
