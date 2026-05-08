const express = require("express");
const router = express.Router();
const {
  getHospitalsPublic,
  getHospitalPublic,
} = require("../controllers/hospitalController");

router.get("/", getHospitalsPublic);
router.get("/:name", getHospitalPublic);

module.exports = router;
