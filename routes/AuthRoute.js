const express = require("express");
const { login, logout } = require("../controllers/Auth.js");
const checkLogin = require("../middleware/checkLogin.js"); 

const router = express.Router();

// Rute Login 
router.post("/admin/login", login);

// Rute Logout 
router.post("/admin/logout", checkLogin, logout);

module.exports = router;
