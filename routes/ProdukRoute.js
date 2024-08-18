    const express = require('express');
    const router = express.Router();

    const Produks = require('../controllers/Produks.js');

    //Rute Get
    router.get('/produk', Produks.getAllProduk);
    router.get('/produk/:id', Produks.getProdukById);
    router.get("/produk/kategori/:kategoriId", Produks.getAllProdukByKategori);
    router.get('/produk/detail/:id', Produks.getDetailProdukById);
    router.get('/produk/allproduk/kategori', Produks.getAllProdukAndKategori);

    //Rute Post
    router.post('/produk', Produks.createProduk);

    //Rute Put
    router.put('/produk/:id', Produks.updateProduk);

    //Rute Delete
    router.delete('/produk/:id', Produks.deleteProduk);

    module.exports = router;
