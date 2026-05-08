// patientRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllPatients,
  getPatient,
  updatePatient,
  getMyProfile,
} = require("../controllers/patientController");
const { protect, authorize } = require("../middleware/auth");

router.get("/me", protect, authorize("patient"), getMyProfile);
router.get(
  "/",
  protect,
  authorize("super_admin", "hospital_admin", "admin", "doctor"),
  getAllPatients,
);
router.get("/:id", protect, getPatient);
router.put(
  "/:id",
  protect,
  authorize("super_admin", "hospital_admin", "admin", "patient"),
  updatePatient,
);

module.exports = router;
