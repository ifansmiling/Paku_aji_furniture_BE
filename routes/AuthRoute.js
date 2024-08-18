const express = require('express');
const { login, logout } = require('../controllers/Auth.js');
const router = express.Router();

router.post('/admin/login', login);
router.post('/admin/logout', logout);

module.exports = router;
