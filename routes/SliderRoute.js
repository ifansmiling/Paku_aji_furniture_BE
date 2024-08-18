const express = require('express');
const router = express.Router();

const Sliders = require('../controllers/Sliders.js');

//Rute Get
router.get('/slider', Sliders.getAllSlider);
router.get('/slider/:id', Sliders.getSliderById);

//Rutet Post
router.post('/slider', Sliders.createSlider);

//Rute Put 
router.put('/slider/:id', Sliders.updateSlider);

//Rute Delete
router.delete('/slider/:id', Sliders.deleteSlider);

module.exports = router;
