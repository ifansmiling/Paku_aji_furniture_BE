const { v4: uuidv4 } = require("uuid");
const argon2 = require("argon2");
const Admin = require("../models/AdminModel.js");

// Membuat akun admin
exports.createAdmin = async (req, res) => {
  const { nama, email, kataSandi } = req.body;

  try {
    const hashedPassword = await argon2.hash(kataSandi);

    const newAdmin = await Admin.create({
      id: uuidv4(),
      nama,
      email,
      kataSandi: hashedPassword,
    });

    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mendaoat data semua admin
exports.getAllAdmin = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mendapatakan data admin berdasarkan id
exports.getAdminById = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findByPk(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update data admin berdasarkan ID
exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { nama, email, kataSandi } = req.body;

  try {
    const admin = await Admin.findByPk(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    let hashedPassword = admin.kataSandi;
    if (kataSandi) {
      hashedPassword = await argon2.hash(kataSandi);
    }

    await admin.update({
      nama,
      email,
      kataSandi: hashedPassword,
    });

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Menghapus data admin
exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findByPk(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await admin.destroy();
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
