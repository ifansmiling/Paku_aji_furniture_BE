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
  upload.array("gambar"), // Pastikan ini sesuai dengan nama field di form-data
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

    // Validasi nomor WhatsApp
    if (linkWhatsApp && !/^[0-9]{10,15}$/.test(linkWhatsApp)) {
      return res
        .status(400)
        .json({ message: "Format nomor WhatsApp tidak valid" });
    }

    const gambar = req.files ? req.files.map((file) => file.filename) : []; // Mengambil nama file dari req.files

    try {
      const kategori = await Kategori.findByPk(kategoriId);
      if (!kategori)
        return res.status(404).json({ message: "Kategori tidak ditemukan" });

      const cleanHarga = parseInt(harga.replace(/[^0-9]/g, ""), 10);

      // Bentuk URL WhatsApp dari nomor telepon
      const whatsappURL = `https://wa.me/${linkWhatsApp}`;

      const newProduk = await Produk.create({
        id: uuidv4(),
        nama,
        warna,
        bahan,
        dimensi,
        deskripsiProduk,
        finishing,
        gambar: gambar.join(","), // Menggabungkan nama file menjadi string yang dipisahkan koma
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
          : [], // Mengubah string menjadi array URL gambar
      };

      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
];


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
      // Memecah string gambar menjadi array dan menambahkan baseURL ke setiap gambar
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
          attributes: ["id", "namaKategori"], // Mengambil id dan namaKategori dari tabel Kategori
        },
      ],
    });

    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Memecah string gambar menjadi array jika ada lebih dari satu gambar
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
  upload.array("gambar", 5), // Maksimal 5 gambar, sesuaikan sesuai kebutuhan
  async (req, res) => {
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

    // Validasi nomor WhatsApp
    if (linkWhatsApp && !/^[0-9]{10,15}$/.test(linkWhatsApp)) {
      return res
        .status(400)
        .json({ message: "Format nomor WhatsApp tidak valid" });
    }

    const gambarBaru = req.files ? req.files.map((file) => file.filename) : [];

    try {
      const produk = await Produk.findByPk(id);
      if (!produk)
        return res.status(404).json({ message: "Produk tidak ditemukan" });

      // Hapus gambar lama jika ada
      if (produk.gambar) {
        const oldImages = produk.gambar.split(",");
        oldImages.forEach((img) => {
          const oldImagePath = path.join("uploads/produks/", img);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        });
      }

      // Update data produk
      const updatedData = {
        nama,
        warna,
        bahan,
        dimensi,
        deskripsiProduk,
        finishing,
        gambar: gambarBaru.join(","), // Simpan nama gambar sebagai string yang dipisahkan koma
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
          ? updatedData.gambar.split(",").map((img) => baseURL + img)
          : [],
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
];

// Mendapatkan semua produk berdasarkan kategori
exports.getAllProdukByKategori = async (req, res) => {
  const { kategoriId } = req.params;

  try {
    // Periksa apakah kategori ada
    const kategori = await Kategori.findByPk(kategoriId);
    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    // Ambil semua produk berdasarkan kategoriId dan sertakan informasi kategori
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
          attributes: ["id", "namaKategori"], // Menggunakan namaKategori sesuai dengan model
        },
      ],
    });

    // Bangun respons dengan URL gambar yang benar dan informasi kategori
    const response = produks.map((produk) => {
      // Memecah string gambar menjadi array dan menambahkan baseURL ke setiap gambar
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
        gambar: gambarArray.length > 0 ? gambarArray : null, // Mengirim array gambar
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

    // Jika produk memiliki gambar yang disimpan sebagai string dipisahkan oleh koma
    if (produk.gambar) {
      // Memecah string gambar menjadi array berdasarkan koma
      const gambarArray = produk.gambar.split(",");

      // Iterasi melalui setiap gambar untuk menghapusnya
      for (const gambar of gambarArray) {
        const filePath = path.join("uploads/produks/", gambar);
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

    await produk.destroy();
    res.status(200).json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error(`Error deleting product: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
