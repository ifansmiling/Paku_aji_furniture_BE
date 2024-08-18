const express = require('express');
const router = express.Router();

const Kategoris = require('../controllers/Kategoris.js');

// Rute Get
router.get('/kategori', Kategoris.getAllKategori);
router.get('/kategori/:id', Kategoris.getKategoriById);

// Rute Post
router.post('/kategori', Kategoris.createKategori);

// Rute Put
router.put('/kategori/:id', Kategoris.updateKategori);

// Rute Delete
router.delete('/kategori/:id', Kategoris.deleteKategori);

module.exports = router;
