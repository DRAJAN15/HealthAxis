const MedicalRecord = require("../models/MedicalRecord");
const Appointment = require("../models/Appointment");

const toNumberOrUndefined = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

const sanitizePrescriptions = (prescriptions = []) => {
  const cleaned = [];

  for (const item of prescriptions) {
    const medicine = (item?.medicine || "").trim();
    const dosage = (item?.dosage || "").trim();
    const frequency = (item?.frequency || "").trim();
    const duration = (item?.duration || "").trim();
    const notes = (item?.notes || "").trim();

    const hasAny = medicine || dosage || frequency || duration || notes;
    if (!hasAny) continue;

    if (!medicine || !dosage || !frequency || !duration) {
      return {
        error:
          "Each prescription must include medicine, dosage, frequency, and duration",
      };
    }

    cleaned.push({ medicine, dosage, frequency, duration, notes });
  }

  return { data: cleaned };
};

// @desc    Create medical record (Doctor)
// @route   POST /api/records
// @access  Doctor
exports.createRecord = async (req, res, next) => {
  try {
    const {
      patientId,
      appointmentId,
      diagnosis,
      symptoms,
      prescriptions,
      labTests,
      vitals,
      notes,
      followUpDate,
    } = req.body;

    if (!patientId || !diagnosis) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Patient and diagnosis are required",
        });
    }

    const appointment = appointmentId
      ? await Appointment.findById(appointmentId)
      : null;
    if (appointmentId && !appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Linked appointment not found" });
    }

    if (
      appointment &&
      appointment.doctor.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to link this appointment",
        });
    }

    if (appointment && appointment.patient.toString() !== String(patientId)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Selected patient does not match the linked appointment",
        });
    }

    const prescriptionResult = sanitizePrescriptions(prescriptions || []);
    if (prescriptionResult.error) {
      return res
        .status(400)
        .json({ success: false, message: prescriptionResult.error });
    }

    const cleanVitals = {
      bloodPressure: (vitals?.bloodPressure || "").trim(),
      heartRate: toNumberOrUndefined(vitals?.heartRate),
      temperature: toNumberOrUndefined(vitals?.temperature),
      weight: toNumberOrUndefined(vitals?.weight),
      height: toNumberOrUndefined(vitals?.height),
      oxygenSaturation: toNumberOrUndefined(vitals?.oxygenSaturation),
    };

    // If linked to appointment, mark it completed
    if (appointment) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        status: "completed",
      });
    }

    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: req.user._id,
      appointment: appointmentId || null,
      diagnosis,
      symptoms: symptoms || [],
      prescriptions: prescriptionResult.data,
      labTests: labTests || [],
      vitals: cleanVitals,
      notes,
      followUpDate,
    });

    await record.populate([
      { path: "patient", select: "name email" },
      { path: "doctor", select: "name email" },
    ]);

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Get medical records
// @route   GET /api/records
// @access  Doctor (own patients) | Patient (own) | Admin
exports.getRecords = async (req, res, next) => {
  try {
    const { patientId, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (req.user.role === "patient") {
      filter.patient = req.user._id;
    } else if (req.user.role === "doctor") {
      filter.doctor = req.user._id;
      if (patientId) filter.patient = patientId;
    } else if (
      ["super_admin", "hospital_admin", "admin"].includes(req.user.role) &&
      patientId
    ) {
      filter.patient = patientId;
    }

    const total = await MedicalRecord.countDocuments(filter);
    const records = await MedicalRecord.find(filter)
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .populate("appointment", "appointmentDate timeSlot")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      pages: Math.ceil(total / limit),
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single medical record
// @route   GET /api/records/:id
// @access  Doctor, Patient (own), Admin
exports.getRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .populate("appointment");

    if (!record)
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });

    const uid = req.user._id.toString();
    if (
      (req.user.role === "patient" && record.patient._id.toString() !== uid) ||
      (req.user.role === "doctor" && record.doctor._id.toString() !== uid)
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medical record (Doctor, own record)
// @route   PUT /api/records/:id
// @access  Doctor
exports.updateRecord = async (req, res, next) => {
  try {
    let record = await MedicalRecord.findById(req.params.id);
    if (!record)
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });

    if (record.doctor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate(["patient", "doctor"]);

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};
