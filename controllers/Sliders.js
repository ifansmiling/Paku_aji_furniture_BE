const { v4: uuidv4 } = require('uuid');
const Slider = require('../models/SliderModel.js');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/sliders/');
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Base URL untuk akses file
const baseURL = '/uploads/sliders/';

// Membuat data slider
exports.createSlider = [
  upload.single('gambar'),
  async (req, res) => {
    const gambar = req.file ? req.file.filename : null;
    
    try {
      const newSlider = await Slider.create({
        id: uuidv4(),
        gambar,
      });

      const response = {
        ...newSlider.toJSON(),
        gambar: newSlider.gambar ? baseURL + newSlider.gambar : null
      };

      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// Mendapatkan semua data slider
exports.getAllSlider = async (req, res) => {
  try {
    const sliders = await Slider.findAll();

    const response = sliders.map(slider => ({
      ...slider.toJSON(),
      gambar: slider.gambar ? baseURL + slider.gambar : null
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mendapatkan slider berdasarkan ID
exports.getSliderById = async (req, res) => {
  const { id } = req.params;

  try {
    const slider = await Slider.findByPk(id);
    if (!slider) return res.status(404).json({ message: 'Slider tidak ditemukan' });

    const response = {
      ...slider.toJSON(),
      gambar: slider.gambar ? baseURL + slider.gambar : null
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update slider berdasarkan ID
exports.updateSlider = [
  upload.single('gambar'),
  async (req, res) => {
    const { id } = req.params;
    const gambar = req.file ? req.file.filename : null;

    try {
      const slider = await Slider.findByPk(id);
      if (!slider) return res.status(404).json({ message: 'Slider tidak ditemukan' });

      if (req.file && slider.gambar) {
        fs.unlinkSync(path.join('uploads/sliders/', slider.gambar));
      }

      const updatedData = {
        gambar: gambar || slider.gambar
      };

      await slider.update(updatedData);

      const response = {
        ...slider.toJSON(),
        gambar: slider.gambar ? baseURL + slider.gambar : null
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// Menghapus slider berdasarkan ID
exports.deleteSlider = async (req, res) => {
  const { id } = req.params;

  try {
    const slider = await Slider.findByPk(id);
    if (!slider) return res.status(404).json({ message: 'Slider tidak ditemukan' });

    if (slider.gambar) {
      fs.unlinkSync(path.join('uploads/sliders/', slider.gambar));
    }

    await slider.destroy();
    res.status(200).json({ message: 'Slider berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
