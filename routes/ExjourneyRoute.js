const express = require("express");
const router = express.Router();
const {
  createJourney,
  getAllJourneys,
  getJourneyById,
  updateJourney,
  deleteJourney,
  deleteImage,
} = require("../controllers/Exjournies.js");

// Rute Get
router.get("/journey", getAllJourneys);
router.get("/journey/:id", getJourneyById);

//Rute Post
router.post("/journey", createJourney);

//Rute Put
router.put("/journey/:id", updateJourney);

//Rute Delete
router.delete("/journey/:id", deleteJourney);
router.delete("/journey/image/:filename", deleteImage);

module.exports = router;
