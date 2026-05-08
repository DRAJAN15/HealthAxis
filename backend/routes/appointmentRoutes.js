const express = require("express");
const router = express.Router();
const {
  bookAppointment,
  getAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("patient"), bookAppointment);
router.get("/", protect, getAppointments);
router.get("/:id", protect, getAppointment);
router.put(
  "/:id/status",
  protect,
  authorize("super_admin", "hospital_admin", "admin", "doctor"),
  updateAppointmentStatus,
);
router.put("/:id/cancel", protect, authorize("patient"), cancelAppointment);

module.exports = router;
