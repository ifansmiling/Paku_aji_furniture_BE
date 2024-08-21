const { v4: uuidv4 } = require("uuid");
const Produk = require("../models/ProdukModel.js");
const Kategori = require("../models/KategoriModel.js");
const path = require("path");
const fs = require("fs").promises;
const multer = require("multer");

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/produks/");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Base URL untuk akses file
const baseURL = "/uploads/produks/";

// Membuat produk baru
exports.createProduk = [
  upload.array("gambar"), 
  async (req, res) => {
    const {
      nama,
      warna,
      bahan,
      dimensi,
      deskripsiProduk,
      finishing,
      kategoriId,
      linkShopee,
      linkWhatsApp,
      linkTokopedia,
      harga,
    } = req.body;

    if (linkWhatsApp && !/^[0-9]{10,15}$/.test(linkWhatsApp)) {
      return res
        .status(400)
        .json({ message: "Format nomor WhatsApp tidak valid" });
    }

    const gambar = req.files ? req.files.map((file) => file.filename) : []; 

    try {
      const kategori = await Kategori.findByPk(kategoriId);
      if (!kategori)
        return res.status(404).json({ message: "Kategori tidak ditemukan" });

      const cleanHarga = parseInt(harga.replace(/[^0-9]/g, ""), 10);

      const whatsappURL = `https://wa.me/${linkWhatsApp}`;

      const newProduk = await Produk.create({
        id: uuidv4(),
        nama,
        warna,
        bahan,
        dimensi,
        deskripsiProduk,
        finishing,
        gambar: gambar.join(","), 
        linkShopee,
        linkWhatsApp: whatsappURL,
        linkTokopedia,
        harga: cleanHarga,
        kategoriId,
      });

      const response = {
        ...newProduk.toJSON(),
        gambar: newProduk.gambar
          ? newProduk.gambar.split(",").map((img) => baseURL + img)
          : [], 
      };

      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
];

//Mendapatkan data semua produk dan kategori
exports.getAllProdukAndKategori = async (req, res) => {
  try {
    const produks = await Produk.findAll({
      attributes: [
        "id",
        "nama",
        "warna",
        "bahan",
        "dimensi",
        "deskripsiProduk",
        "finishing",
        "gambar",
        "harga",
        "linkShopee",
        "linkWhatsApp",
        "linkTokopedia",
        "kategoriId",
      ],
      include: [
        {
          model: Kategori,
          attributes: ["id", "namaKategori"],
        },
      ],
    });

    const response = produks.map((produk) => ({
      ...produk.toJSON(),
      gambar: produk.gambar ? baseURL + produk.gambar : null,
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mendapatkan semua produk
exports.getAllProduk = async (req, res) => {
  try {
    const produks = await Produk.findAll({
      attributes: [
        "id",
        "nama",
        "harga",
        "linkTokopedia",
        "linkShopee",
        "linkWhatsApp",
        "gambar",
        "kategoriId",
      ],
      include: {
        model: Kategori,
        attributes: ["id", "namaKategori"],
      },
    });

    const response = produks.map((produk) => {
      const gambarArray = produk.gambar
        ? produk.gambar.split(",").map((gambar) => baseURL + gambar.trim())
        : [];

      return {
        id: produk.id,
        nama: produk.nama,
        harga: produk.harga,
        linkTokopedia: produk.linkTokopedia,
        linkShopee: produk.linkShopee,
        linkWhatsApp: produk.linkWhatsApp,
        gambar: gambarArray.length > 0 ? gambarArray : null,
        kategori: produk.Kategori
          ? {
              id: produk.Kategori.id,
              namaKategori: produk.Kategori.namaKategori,
            }
          : null,
      };
    });

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Mendapatkan produk terbaru
exports.getLatestProduk = async (req, res) => {
  try {
    const latestProduks = await Produk.findAll({
      order: [["createdAt", "DESC"]],
      limit: 4,
      attributes: [
        "id",
        "nama",
        "harga",
        "linkTokopedia",
        "linkShopee",
        "linkWhatsApp",
        "gambar",
        "kategoriId",
      ],
      include: {
        model: Kategori,
        attributes: ["id", "namaKategori"],
      },
    });

    console.log("Latest Produk Query Result:", latestProduks);

    if (latestProduks.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const response = latestProduks.map((produk) => {
      const gambarArray = produk.gambar
        ? produk.gambar.split(",").map((gambar) => baseURL + gambar.trim())
        : [];

      return {
        id: produk.id,
        nama: produk.nama,
        harga: produk.harga,
        linkTokopedia: produk.linkTokopedia,
        linkShopee: produk.linkShopee,
        linkWhatsApp: produk.linkWhatsApp,
        gambar: gambarArray.length > 0 ? gambarArray : null,
        kategori: produk.Kategori,
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Error saat mengambil produk terbaru:", error);
    res.status(500).json({ error: error.message });
  }
};

// Mendapatkan produk berdasarkan ID
exports.getProdukById = async (req, res) => {
  const { id } = req.params;

  try {
    const produk = await Produk.findOne({
      where: { id },
      attributes: [
        "id",
        "nama",
        "warna",
        "bahan",
        "dimensi",
        "deskripsiProduk",
        "finishing",
        "gambar",
        "harga",
        "linkShopee",
        "linkWhatsApp",
        "linkTokopedia",
        "kategoriId",
      ],
      include: [
        {
          model: Kategori,
          attributes: ["id", "namaKategori"], 
        },
      ],
    });

    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const gambarArray = produk.gambar
      ? produk.gambar.split(",").map((gambar) => baseURL + gambar.trim())
      : [];

    const response = {
      ...produk.toJSON(),
      gambar: gambarArray,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update produk berdasarkan ID
exports.updateProduk = [
  upload.array("gambar", 5),
  async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);

    const { id } = req.params;
    const {
      nama,
      warna,
      bahan,
      dimensi,
      deskripsiProduk,
      finishing,
      kategoriId,
      linkShopee,
      linkWhatsApp,
      linkTokopedia,
      harga,
    } = req.body;

    if (linkWhatsApp && !/^[0-9]{10,15}$/.test(linkWhatsApp)) {
      return res
        .status(400)
        .json({ message: "Format nomor WhatsApp tidak valid" });
    }

    const newImages = req.files ? req.files.map((file) => file.filename) : [];

    try {
      const produk = await Produk.findByPk(id);
      if (!produk)
        return res.status(404).json({ message: "Produk tidak ditemukan" });

      if (newImages.length > 0 && produk.gambar) {
        const oldImages = produk.gambar.split(",");
        for (const image of oldImages) {
          const oldImagePath = path.join("uploads/produks/", image);
          try {
            await fs.access(oldImagePath); 
            await fs.unlink(oldImagePath); 
          } catch (err) {
            console.log(
              `Failed to delete file: ${oldImagePath}. Error: ${err.message}`
            );
          }
        }
      }

      const updatedData = {
        nama,
        warna,
        bahan,
        dimensi,
        deskripsiProduk,
        finishing,
        gambar: newImages.length > 0 ? newImages.join(",") : produk.gambar,
        linkShopee,
        linkWhatsApp,
        linkTokopedia,
        harga: parseInt(harga.replace(/[^0-9]/g, ""), 10),
        kategoriId,
      };

      await produk.update(updatedData);

      const response = {
        ...produk.toJSON(),
        gambar: updatedData.gambar
          ? updatedData.gambar.split(",").map((filename) => baseURL + filename)
          : [],
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error saat memperbarui produk:", error);
      res.status(500).json({ error: error.message });
    }
  },
];

// Mendapatkan semua produk berdasarkan kategori
exports.getAllProdukByKategori = async (req, res) => {
  const { kategoriId } = req.params;

  try {
    const kategori = await Kategori.findByPk(kategoriId);
    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    const produks = await Produk.findAll({
      where: { kategoriId: kategoriId },
      attributes: [
        "id",
        "nama",
        "harga",
        "linkTokopedia",
        "linkShopee",
        "linkWhatsApp",
        "gambar",
      ],
      include: [
        {
          model: Kategori,
          attributes: ["id", "namaKategori"], 
        },
      ],
    });

    const response = produks.map((produk) => {
      const gambarArray = produk.gambar
        ? produk.gambar.split(",").map((gambar) => baseURL + gambar.trim())
        : [];

      return {
        id: produk.id,
        nama: produk.nama,
        harga: produk.harga,
        linkTokopedia: produk.linkTokopedia,
        linkShopee: produk.linkShopee,
        linkWhatsApp: produk.linkWhatsApp,
        gambar: gambarArray.length > 0 ? gambarArray : null,
        kategori: produk.Kategori
          ? { id: produk.Kategori.id, nama: produk.Kategori.namaKategori }
          : null,
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ error: error.message });
  }
};

// Mendapatkan detail produk berdasarkan ID
exports.getDetailProdukById = async (req, res) => {
  const { id } = req.params;

  try {
    const produk = await Produk.findByPk(id);

    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const response = {
      id: produk.id,
      gambar: produk.gambar ? baseURL + produk.gambar : null,
      nama: produk.nama,
      harga: produk.harga,
      deskripsiProduk: produk.deskripsiProduk,
      dimensi: produk.dimensi,
      warna: produk.warna,
      finishing: produk.finishing,
      bahan: produk.bahan,
      linkWhatsApp: produk.linkWhatsApp,
      linkShopee: produk.linkShopee,
      linkTokopedia: produk.linkTokopedia,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Menghapus produk berdasarkan ID
exports.deleteProduk = async (req, res) => {
  const { id } = req.params;

  try {
    const produk = await Produk.findByPk(id);
    if (!produk)
      return res.status(404).json({ message: "Produk tidak ditemukan" });

    if (produk.gambar) {
      const gambarArray = produk.gambar.split(",");

      for (const gambar of gambarArray) {
        const filePath = path.join("uploads/produks/", gambar);
        try {
          console.log(`Trying to delete file: ${filePath}`);
          await fs.unlink(filePath); 
          console.log(`File deleted: ${filePath}`);
        } catch (err) {
          console.log(
            `Failed to delete file: ${filePath}. Error: ${err.message}`
          );
        }
      }
    }

    await produk.destroy();
    res.status(200).json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error(`Error deleting product: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
