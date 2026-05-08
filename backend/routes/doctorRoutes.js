const express = require("express");
const router = express.Router();
const {
  getAllDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAvailableSlots,
  getManagedDoctors,
} = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", getAllDoctors);
router.get(
  "/manage",
  protect,
  authorize("super_admin", "hospital_admin", "admin"),
  getManagedDoctors,
);
router.get("/:id", getDoctor);
router.get("/:id/slots", protect, getAvailableSlots);

router.post(
  "/",
  protect,
  authorize("super_admin", "hospital_admin", "admin"),
  createDoctor,
);
router.put(
  "/:id",
  protect,
  authorize("super_admin", "hospital_admin", "admin", "doctor"),
  updateDoctor,
);
router.delete(
  "/:id",
  protect,
  authorize("super_admin", "hospital_admin", "admin"),
  deleteDoctor,
);

module.exports = router;
