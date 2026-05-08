const User = require("../models/User");
const PatientProfile = require("../models/PatientProfile");
const Appointment = require("../models/Appointment");
const DoctorProfile = require("../models/DoctorProfile");

const getScopedPatientIds = async (user) => {
  if (user.role === "doctor") {
    return Appointment.distinct("patient", { doctor: user._id });
  }

  if (user.role === "hospital_admin") {
    if (!user.hospital) return [];
    const doctorIds = await DoctorProfile.distinct("user", {
      hospital: user.hospital,
    });
    if (!doctorIds.length) return [];
    return Appointment.distinct("patient", { doctor: { $in: doctorIds } });
  }

  return null;
};

// @desc    Get all patients (Admin/Doctor)
// @route   GET /api/patients
// @access  Admin, Doctor
exports.getAllPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    let filter = { role: "patient", isActive: true };
    if (search) filter.name = { $regex: search, $options: "i" };

    const scopedPatientIds = await getScopedPatientIds(req.user);
    if (Array.isArray(scopedPatientIds)) {
      filter._id = { $in: scopedPatientIds };
    }

    const patients = await User.find(filter).select("-password");
    const patientIds = patients.map((p) => p._id);
    const profiles = await PatientProfile.find({ user: { $in: patientIds } });
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const result = patients.map((pat) => ({
      ...pat.toObject(),
      profile: profileMap[pat._id.toString()] || null,
    }));

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Admin, Doctor, Patient (own)
exports.getPatient = async (req, res, next) => {
  try {
    if (
      req.user.role === "patient" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (req.user.role === "doctor" || req.user.role === "hospital_admin") {
      const scopedPatientIds = await getScopedPatientIds(req.user);
      const hasAccess = scopedPatientIds.some(
        (id) => id.toString() === req.params.id,
      );
      if (!hasAccess) {
        return res
          .status(403)
          .json({ success: false, message: "Not authorized" });
      }
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user || user.role !== "patient") {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }
    const profile = await PatientProfile.findOne({ user: user._id });
    res
      .status(200)
      .json({ success: true, data: { ...user.toObject(), profile } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/:id
// @access  Patient (own), Admin
exports.updatePatient = async (req, res, next) => {
  try {
    if (
      req.user.role === "patient" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (req.user.role === "hospital_admin") {
      const scopedPatientIds = await getScopedPatientIds(req.user);
      const hasAccess = scopedPatientIds.some(
        (id) => id.toString() === req.params.id,
      );
      if (!hasAccess) {
        return res
          .status(403)
          .json({ success: false, message: "Not authorized" });
      }
    }

    const {
      name,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies,
      chronicConditions,
      currentMedications,
      insuranceProvider,
      insurancePolicyNumber,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone },
      { new: true, runValidators: true },
    ).select("-password");

    const profile = await PatientProfile.findOneAndUpdate(
      { user: req.params.id },
      {
        dateOfBirth,
        gender,
        bloodGroup,
        address,
        emergencyContact,
        allergies,
        chronicConditions,
        currentMedications,
        insuranceProvider,
        insurancePolicyNumber,
      },
      { new: true, runValidators: true, upsert: true },
    );

    res
      .status(200)
      .json({ success: true, data: { ...user.toObject(), profile } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my profile (Patient)
// @route   GET /api/patients/me
// @access  Patient
exports.getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const profile = await PatientProfile.findOne({ user: req.user._id });
    res
      .status(200)
      .json({ success: true, data: { ...user.toObject(), profile } });
  } catch (error) {
    next(error);
  }
};
