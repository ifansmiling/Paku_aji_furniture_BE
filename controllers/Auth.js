const Admin = require('../models/AdminModel.js');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, kataSandi } = req.body;

    try {
        const admin = await Admin.findOne({ where: { email } });
        if (!admin) {
            console.log('Email tidak ditemukan');
            return res.status(404).json({ message: 'Email tidak ditemukan' });
        }

        const match = await argon2.verify(admin.kataSandi, kataSandi);
        if (!match) {
            console.log('Kata sandi salah');
            return res.status(400).json({ message: 'Kata sandi salah' });
        }

        req.session.adminId = admin.id;
        console.log('Login berhasil');

        // Buat token JWT
        const token = jwt.sign({ adminId: admin.id }, 'wdwap9gQEGO9FH829Q4GH09Q2G0G4HQ0GH0Q4GH49H', { expiresIn: '1h' }); // Gantilah 'secret_key' dengan kunci rahasia Anda

        res.status(200).json({ success: true, message: 'Login berhasil', token });
    } catch (error) {
        console.error('Error: ', error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Logout berhasil' });
    });
};
