const express = require("express");
const router = express.Router();
const checkLogin = require("../middleware/checkLogin.js"); 

const Admins = require("../controllers/Admins.js");

// Rute Get 
router.get("/admin", checkLogin, Admins.getAllAdmin);
router.get("/admin/:id", checkLogin, Admins.getAdminById);

// Rute Post 
router.post("/admin", checkLogin, Admins.createAdmin);

// Rute Put 
router.put("/admin/:id", checkLogin, Admins.updateAdmin);

// Rute Delete 
router.delete("/admin/:id", checkLogin, Admins.deleteAdmin);

module.exports = router;
