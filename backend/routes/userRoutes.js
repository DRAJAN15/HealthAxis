const express = require("express");
const router = express.Router();
const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");
const Hospital = require("../models/Hospital");
const { protect, authorize } = require("../middleware/auth");

// @desc  Get all hospital admins (Super Admin)
router.get(
  "/hospital-admins",
  protect,
  authorize("super_admin"),
  async (req, res, next) => {
    try {
      const users = await User.find({ role: "hospital_admin" })
        .select("-password")
        .sort({ createdAt: -1 });
      res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
      next(err);
    }
  },
);

// @desc  Create hospital admin (Super Admin)
router.post(
  "/hospital-admins",
  protect,
  authorize("super_admin"),
  async (req, res, next) => {
    try {
      const { name, email, password, phone, hospital } = req.body;
      if (!hospital) {
        return res
          .status(400)
          .json({ success: false, message: "Hospital is required" });
      }

      const user = await User.create({
        name,
        email,
        password,
        phone,
        hospital,
        role: "hospital_admin",
      });
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },
);

// @desc  Update hospital admin (Super Admin)
router.put(
  "/hospital-admins/:id",
  protect,
  authorize("super_admin"),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user || user.role !== "hospital_admin") {
        return res
          .status(404)
          .json({ success: false, message: "Hospital admin not found" });
      }

      const { name, email, phone, hospital, isActive, password } = req.body;
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (hospital !== undefined) user.hospital = hospital;
      if (typeof isActive === "boolean") user.isActive = isActive;
      if (password) user.password = password;

      await user.save();
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },
);

// @desc  Get hospitals (Super Admin)
router.get(
  "/hospitals",
  protect,
  authorize("super_admin"),
  async (req, res, next) => {
    try {
      const hospitalsFromDoctors = await DoctorProfile.aggregate([
        { $match: { hospital: { $ne: "" } } },
        { $group: { _id: "$hospital", doctorCount: { $sum: 1 } } },
      ]);

      const hospitalDocs = await Hospital.find({ isActive: true }).select(
        "name",
      );

      const countMap = new Map();
      hospitalsFromDoctors.forEach((h) => countMap.set(h._id, h.doctorCount));

      const names = new Set(hospitalDocs.map((h) => h.name));
      hospitalsFromDoctors.forEach((h) => names.add(h._id));

      const hospitals = Array.from(names)
        .sort((a, b) => a.localeCompare(b))
        .map((name) => ({ name, doctorCount: countMap.get(name) || 0 }));

      res
        .status(200)
        .json({ success: true, count: hospitals.length, data: hospitals });
    } catch (err) {
      next(err);
    }
  },
);

// @desc  Create hospital (Super Admin)
router.post(
  "/hospitals",
  protect,
  authorize("super_admin"),
  async (req, res, next) => {
    try {
      const rawName = req.body?.name;
      const name = typeof rawName === "string" ? rawName.trim() : "";
      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Hospital name is required" });
      }

      const existingInDoctors = await DoctorProfile.findOne({
        hospital: name,
      }).select("_id");
      const existingInHospitals = await Hospital.findOne({ name }).select(
        "_id isActive",
      );

      if (existingInHospitals?.isActive || existingInDoctors) {
        return res
          .status(400)
          .json({ success: false, message: "Hospital already exists" });
      }

      if (existingInHospitals && !existingInHospitals.isActive) {
        existingInHospitals.isActive = true;
        await existingInHospitals.save();
        return res
          .status(200)
          .json({ success: true, data: existingInHospitals });
      }

      const hospital = await Hospital.create({ name });
      res.status(201).json({ success: true, data: hospital });
    } catch (err) {
      next(err);
    }
  },
);

// @desc  Rename hospital across doctors and hospital admins (Super Admin)
router.put(
  "/hospitals/rename",
  protect,
  authorize("super_admin"),
  async (req, res, next) => {
    try {
      const { from, to } = req.body;
      if (!from || !to) {
        return res
          .status(400)
          .json({ success: false, message: "Both from and to are required" });
      }

      const doctorResult = await DoctorProfile.updateMany(
        { hospital: from },
        { $set: { hospital: to } },
      );

      const adminResult = await User.updateMany(
        { role: "hospital_admin", hospital: from },
        { $set: { hospital: to } },
      );

      await Hospital.findOneAndUpdate(
        { name: from },
        { $set: { name: to, isActive: true } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      res.status(200).json({
        success: true,
        data: {
          updatedDoctors: doctorResult.modifiedCount,
          updatedHospitalAdmins: adminResult.modifiedCount,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// @desc  Get all users (Super Admin)
router.get("/", protect, authorize("super_admin"), async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
});

// @desc  Toggle user active status (Super Admin)
router.put(
  "/:id/toggle-active",
  protect,
  authorize("super_admin"),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      user.isActive = !user.isActive;
      await user.save();
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },
);

// @desc  Update own profile
router.put("/profile", protect, async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true },
    ).select("-password");
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
