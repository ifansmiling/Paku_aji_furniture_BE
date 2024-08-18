const express = require('express');
const router = express.Router();

const Admins = require('../controllers/Admins.js');

//Rute Get
router.get('/admin', Admins.getAllAdmin);
router.get('/admin/:id', Admins.getAdminById);

//Rute Post
router.post('/admin', Admins.createAdmin);

//Rute Put
router.put('/admin/:id', Admins.updateAdmin);

//Rute Delete
router.delete('/admin/:id', Admins.deleteAdmin);

module.exports = router;
