const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");
const Appointment = require("../models/Appointment");

const buildDoctorList = async ({ specialization, search, hospital }) => {
  const filter = { role: "doctor", isActive: true };

  const doctors = await User.find(filter).select("-password");
  const doctorIds = doctors.map((d) => d._id);
  const profiles = await DoctorProfile.find({ user: { $in: doctorIds } });
  const profileMap = {};
  profiles.forEach((p) => {
    profileMap[p.user.toString()] = p;
  });

  let result = doctors.map((doc) => ({
    ...doc.toObject(),
    profile: profileMap[doc._id.toString()] || null,
  }));

  if (specialization) {
    result = result.filter((d) =>
      d.profile?.specialization
        ?.toLowerCase()
        .includes(specialization.toLowerCase()),
    );
  }

  if (hospital) {
    result = result.filter(
      (d) =>
        (d.profile?.hospital || "").toLowerCase() === hospital.toLowerCase(),
    );
  }

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter((d) => {
      const name = (d.name || "").toLowerCase();
      const hospitalName = (d.profile?.hospital || "").toLowerCase();
      const spec = (d.profile?.specialization || "").toLowerCase();
      return name.includes(q) || hospitalName.includes(q) || spec.includes(q);
    });
  }

  return result;
};

// @desc    Get all doctors (with profiles)
// @route   GET /api/doctors
// @access  Public / Private
exports.getAllDoctors = async (req, res, next) => {
  try {
    const { specialization, search, hospital } = req.query;
    const result = await buildDoctorList({ specialization, search, hospital });

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctors for management panel (role scoped)
// @route   GET /api/doctors/manage
// @access  Super Admin | Hospital Admin | Admin
exports.getManagedDoctors = async (req, res, next) => {
  try {
    const { specialization, search, hospital } = req.query;

    let scopedHospital = hospital;
    if (req.user.role === "hospital_admin") {
      if (!req.user.hospital) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Hospital admin is not assigned to any hospital",
          });
      }
      scopedHospital = req.user.hospital;
    }

    const result = await buildDoctorList({
      specialization,
      search,
      hospital: scopedHospital,
    });
    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctor = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user || user.role !== "doctor") {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    const profile = await DoctorProfile.findOne({ user: user._id });
    res
      .status(200)
      .json({ success: true, data: { ...user.toObject(), profile } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create doctor (Admin only)
// @route   POST /api/doctors
// @access  Admin
exports.createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      qualification,
      experience,
      consultationFee,
      bio,
      hospital,
      availability,
    } = req.body;

    let assignedHospital = hospital;
    if (req.user.role === "hospital_admin") {
      if (!req.user.hospital) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Hospital admin is not assigned to any hospital",
          });
      }
      assignedHospital = req.user.hospital;
    }

    if (!assignedHospital) {
      return res
        .status(400)
        .json({ success: false, message: "Hospital is required" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "doctor",
    });
    const profile = await DoctorProfile.create({
      user: user._id,
      specialization,
      qualification,
      experience,
      consultationFee,
      bio,
      hospital: assignedHospital,
      availability: availability || [],
    });

    res
      .status(201)
      .json({ success: true, data: { ...user.toObject(), profile } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Admin | Doctor (own profile)
exports.updateDoctor = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      specialization,
      qualification,
      experience,
      consultationFee,
      bio,
      hospital,
      availability,
      isAcceptingAppointments,
    } = req.body;

    const existingProfile = await DoctorProfile.findOne({
      user: req.params.id,
    });
    if (!existingProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor profile not found" });
    }

    // Authorization: doctor can only update own profile
    if (
      req.user.role === "doctor" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (req.user.role === "hospital_admin") {
      if (!req.user.hospital) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Hospital admin is not assigned to any hospital",
          });
      }
      if (existingProfile.hospital !== req.user.hospital) {
        return res
          .status(403)
          .json({
            success: false,
            message: "You can only manage doctors from your hospital",
          });
      }
    }

    let nextHospital = hospital;
    if (req.user.role === "hospital_admin") nextHospital = req.user.hospital;
    if (req.user.role === "doctor") nextHospital = existingProfile.hospital;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone },
      { new: true, runValidators: true },
    ).select("-password");

    const profile = await DoctorProfile.findOneAndUpdate(
      { user: req.params.id },
      {
        specialization,
        qualification,
        experience,
        consultationFee,
        bio,
        hospital: nextHospital,
        availability,
        isAcceptingAppointments,
      },
      { new: true, runValidators: true },
    );

    res
      .status(200)
      .json({ success: true, data: { ...user.toObject(), profile } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete doctor (Admin only)
// @route   DELETE /api/doctors/:id
// @access  Admin
exports.deleteDoctor = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "doctor") {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    if (req.user.role === "hospital_admin") {
      const profile = await DoctorProfile.findOne({ user: req.params.id });
      if (!profile) {
        return res
          .status(404)
          .json({ success: false, message: "Doctor profile not found" });
      }
      if (!req.user.hospital || profile.hospital !== req.user.hospital) {
        return res
          .status(403)
          .json({
            success: false,
            message: "You can only manage doctors from your hospital",
          });
      }
    }

    user.isActive = false;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Doctor deactivated successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available time slots for a doctor on a date
// @route   GET /api/doctors/:id/slots?date=YYYY-MM-DD
// @access  Private (Patient)
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date)
      return res
        .status(400)
        .json({ success: false, message: "Date is required" });

    const profile = await DoctorProfile.findOne({ user: req.params.id });
    if (!profile)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });

    const dayName = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const dayAvailability = profile.availability.find((a) => a.day === dayName);

    if (!dayAvailability) {
      return res
        .status(200)
        .json({
          success: true,
          data: [],
          message: "Doctor not available on this day",
        });
    }

    // Generate slots
    const slots = [];
    const [startHour, startMin] = dayAvailability.startTime
      .split(":")
      .map(Number);
    const [endHour, endMin] = dayAvailability.endTime.split(":").map(Number);
    const duration = dayAvailability.slotDuration;

    let current = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    while (current + duration <= end) {
      const h1 = String(Math.floor(current / 60)).padStart(2, "0");
      const m1 = String(current % 60).padStart(2, "0");
      const next = current + duration;
      const h2 = String(Math.floor(next / 60)).padStart(2, "0");
      const m2 = String(next % 60).padStart(2, "0");
      slots.push({ startTime: `${h1}:${m1}`, endTime: `${h2}:${m2}` });
      current = next;
    }

    // Remove booked slots
    const booked = await Appointment.find({
      doctor: req.params.id,
      appointmentDate: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      },
      status: { $nin: ["cancelled", "rejected"] },
    });

    const bookedTimes = new Set(booked.map((a) => a.timeSlot.startTime));
    const available = slots.filter((s) => !bookedTimes.has(s.startTime));

    res.status(200).json({ success: true, data: available });
  } catch (error) {
    next(error);
  }
};
