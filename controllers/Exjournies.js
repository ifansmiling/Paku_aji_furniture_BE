const express = require("express");
const { v4: uuidv4 } = require("uuid");
const ExJourney = require("../models/ExjourneyModel.js");
const path = require("path");
const fs = require("fs").promises;
const multer = require("multer");

// Base URL untuk penyimpanan gambar
const baseURL = "/uploads/journeys/";

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/journeys/");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Membuat Data Baru
exports.createJourney = [
  upload.array("gambar", 10),
  async (req, res) => {
    const { judul, tanggal, deskripsi } = req.body;
    const gambar = req.files ? req.files.map((file) => file.filename) : [];

    try {
      const newJourney = await ExJourney.create({
        id: uuidv4(),
        judul,
        tanggal,
        gambar: gambar.join(","),
        deskripsi,
      });

      const response = {
        ...newJourney.toJSON(),
        gambar: newJourney.gambar
          ? newJourney.gambar.split(",").map((filename) => baseURL + filename)
          : [],
      };

      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
];

// Get Semua Data
exports.getAllJourneys = async (req, res) => {
  try {
    const journeys = await ExJourney.findAll();

    const sortedJourneys = journeys
      .map((journey) => ({
        ...journey.toJSON(),
        gambar: journey.gambar
          ? journey.gambar.split(",").map((filename) => baseURL + filename)
          : [],
        tanggal: new Date(journey.tanggal), 
      }))
      .sort((a, b) => b.tanggal - a.tanggal); 

    res.status(200).json(sortedJourneys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Data Berdasarkan ID
exports.getJourneyById = async (req, res) => {
  const { id } = req.params;

  try {
    const journey = await ExJourney.findByPk(id);
    if (!journey)
      return res.status(404).json({ message: "Journey tidak ditemukan" });

    const response = {
      ...journey.toJSON(),
      gambar: journey.gambar
        ? journey.gambar.split(",").map((filename) => baseURL + filename)
        : null,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Data Baru Berdasarkan ID
exports.updateJourney = [
  upload.array("gambar"),
  async (req, res) => {
    const { id } = req.params;
    const { judul, tanggal, deskripsi } = req.body;
    const newImages = req.files ? req.files.map((file) => file.filename) : [];

    try {
      const journey = await ExJourney.findByPk(id);
      if (!journey)
        return res.status(404).json({ message: "Journey tidak ditemukan" });

      // Hapus gambar lama jika ada
      if (journey.gambar) {
        const oldImages = journey.gambar.split(",");
        oldImages.forEach((image) => {
          const oldImagePath = path.join("uploads/journeys/", image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        });
      }

      // Perbarui data journey
      const updatedData = {
        judul,
        tanggal,
        deskripsi,
        gambar: newImages.length > 0 ? newImages.join(",") : journey.gambar,
      };

      await journey.update(updatedData);

      const response = {
        ...journey.toJSON(),
        gambar: updatedData.gambar
          ? updatedData.gambar.split(",").map((filename) => baseURL + filename)
          : [],
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error saat memperbarui journey:", error);
      res.status(500).json({ error: error.message });
    }
  },
];

// Menghapus Data Berdasarkan ID
exports.deleteJourney = async (req, res) => {
  const { id } = req.params;

  try {
    const journey = await ExJourney.findByPk(id);
    if (!journey)
      return res.status(404).json({ message: "Journey tidak ditemukan" });

    // Jika journey memiliki gambar yang disimpan sebagai string dipisahkan oleh koma
    if (journey.gambar) {
      // Memecah string gambar menjadi array berdasarkan koma
      const gambarArray = journey.gambar.split(",");

      // Iterasi melalui setiap gambar untuk menghapusnya
      for (const gambar of gambarArray) {
        const filePath = path.join("uploads/journeys/", gambar);
        try {
          console.log(`Trying to delete file: ${filePath}`);
          await fs.unlink(filePath); // Menghapus file secara asinkron
          console.log(`File deleted: ${filePath}`);
        } catch (err) {
          console.log(
            `Failed to delete file: ${filePath}. Error: ${err.message}`
          );
        }
      }
    }

    await journey.destroy();
    res.status(200).json({ message: "Journey berhasil dihapus" });
  } catch (error) {
    console.error(`Error deleting journey: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Delete Sepesifik untuk Gambar
exports.deleteImage = async (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join("uploads/journeys/", filename);

  try {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      res.status(200).json({ message: "Image deleted successfully" });
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting image", error: error.message });
  }
};
