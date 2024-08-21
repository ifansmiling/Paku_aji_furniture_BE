const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Kategori = require("../models/KategoriModel.js");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Base URL untuk gambar
const baseURL = "/uploads/categories/";

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/categories/");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Membuat data kategori baru
exports.createKategori = [
  upload.single("gambar"),
  async (req, res) => {
    const { namaKategori } = req.body;
    const gambar = req.file ? req.file.filename : null;

    try {
      const newKategori = await Kategori.create({
        id: uuidv4(),
        namaKategori,
        gambar,
      });

      const response = {
        ...newKategori.toJSON(),
        gambar: newKategori.gambar ? baseURL + newKategori.gambar : null,
      };

      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
];

// Mendapatkan semua data kategori
exports.getAllKategori = async (req, res) => {
  try {
    const kategoris = await Kategori.findAll();
    const response = kategoris.map((kategori) => ({
      ...kategori.toJSON(),
      gambar: kategori.gambar ? baseURL + kategori.gambar : null,
    }));
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mendapatkan data kategori berdasarkan ID
exports.getKategoriById = async (req, res) => {
  const { id } = req.params;

  try {
    const kategori = await Kategori.findByPk(id);
    if (!kategori)
      return res.status(404).json({ message: "Kategori tidak ditemukan" });

    const response = {
      ...kategori.toJSON(),
      gambar: kategori.gambar ? baseURL + kategori.gambar : null,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update data kategori berdasarkan ID
exports.updateKategori = [
  upload.single("gambar"),
  async (req, res) => {
    const { id } = req.params;
    const { namaKategori } = req.body;
    const gambar = req.file ? req.file.filename : null;

    try {
      const kategori = await Kategori.findByPk(id);
      if (!kategori)
        return res.status(404).json({ message: "Kategori tidak ditemukan" });

      if (req.file && kategori.gambar) {
        fs.unlinkSync(path.join("uploads/categories/", kategori.gambar));
      }

      const updatedData = {
        namaKategori,
        gambar: gambar || kategori.gambar,
      };

      await kategori.update(updatedData);

      const response = {
        ...kategori.toJSON(),
        gambar: kategori.gambar ? baseURL + kategori.gambar : null,
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
];

// Mendapatkan nama kategori berdasarkan ID
exports.getNamaKategoriById = async (req, res) => {
  const { kategoriId } = req.params;

  try {
    const kategori = await Kategori.findByPk(kategoriId, {
      attributes: ["namaKategori"],
    });

    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    res.status(200).json({ namaKategori: kategori.namaKategori });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Menghapus data kategori berdasarkan ID
exports.deleteKategori = async (req, res) => {
  const { id } = req.params;

  try {
    const kategori = await Kategori.findByPk(id);
    if (!kategori)
      return res.status(404).json({ message: "Kategori tidak ditemukan" });

    if (kategori.gambar) {
      fs.unlinkSync(path.join("uploads/categories/", kategori.gambar));
    }

    await kategori.destroy();
    res.status(200).json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
