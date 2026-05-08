const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getDoctorAnalytics,
  getPatientAnalytics,
} = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");

router.get(
  "/dashboard",
  protect,
  authorize("super_admin", "hospital_admin", "admin"),
  getDashboard,
);
router.get("/doctor", protect, authorize("doctor"), getDoctorAnalytics);
router.get("/patient", protect, authorize("patient"), getPatientAnalytics);

module.exports = router;
