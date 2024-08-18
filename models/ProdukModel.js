const { DataTypes } = require("sequelize");
const db = require("../config/Database");
const Kategori = require("./KategoriModel");

const Produk = db.define(
  "produk",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    warna: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bahan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dimensi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsiProduk: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    finishing: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gambar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    harga: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    linkShopee: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkWhatsApp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkTokopedia: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kategoriId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Kategori,
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

// Relasi Produk ke Kategori
Kategori.hasMany(Produk, { foreignKey: "kategoriId" });
Produk.belongsTo(Kategori, { foreignKey: "kategoriId" });

module.exports = Produk;
