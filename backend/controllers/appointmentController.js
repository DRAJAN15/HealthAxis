const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const { sendEmail, appointmentConfirmedEmail, appointmentCancelledEmail } = require('../utils/email');
const { sendSMS, appointmentConfirmedSMS } = require('../utils/sms');

// @desc    Book appointment (Patient)
// @route   POST /api/appointments
// @access  Patient
exports.bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, timeSlot, reason, type } = req.body;

    // Get doctor profile for fee
    const doctorProfile = await DoctorProfile.findOne({ user: doctorId });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    if (!doctorProfile.isAcceptingAppointments) {
      return res.status(400).json({ success: false, message: 'Doctor is not accepting appointments currently' });
    }

    // Check double booking
    const existing = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      'timeSlot.startTime': timeSlot.startTime,
      status: { $nin: ['cancelled', 'rejected'] },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      reason,
      type: type || 'in-person',
      consultationFee: doctorProfile.consultationFee,
    });

    await appointment.populate(['patient', 'doctor']);

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    // Handle duplicate key (double booking at DB level)
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });
    }
    next(error);
  }
};

// @desc    Get appointments (filtered by role)
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    let filter = {};

    // Role-based filtering
    if (req.user.role === 'patient') filter.patient = req.user._id;
    else if (req.user.role === 'doctor') filter.doctor = req.user._id;
    // Admin sees all

    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.appointmentDate = { $gte: start, $lt: end };
    }

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email')
      .sort({ appointmentDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email')
      .populate('payment');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Authorization check
    const uid = req.user._id.toString();
    if (
      req.user.role === 'patient' && appointment.patient._id.toString() !== uid ||
      req.user.role === 'doctor'  && appointment.doctor._id.toString()  !== uid
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Doctor / Admin)
// @route   PUT /api/appointments/:id/status
// @access  Doctor, Admin
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, doctorNotes, cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Doctor can only update their own appointments
    if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.status = status;
    if (doctorNotes) appointment.doctorNotes = doctorNotes;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;
    await appointment.save();

    const dateStr = new Date(appointment.appointmentDate).toLocaleDateString();
    const timeStr = appointment.timeSlot.startTime;

    // Send notifications
    if (status === 'confirmed') {
      const emailTemplate = appointmentConfirmedEmail(
        appointment.patient.name, appointment.doctor.name, dateStr, timeStr
      );
      await sendEmail({ to: appointment.patient.email, ...emailTemplate });
      if (appointment.patient.phone) {
        const smsMsg = appointmentConfirmedSMS(
          appointment.patient.name, appointment.doctor.name, dateStr, timeStr
        );
        await sendSMS(appointment.patient.phone, smsMsg);
      }
    } else if (status === 'cancelled' || status === 'rejected') {
      const emailTemplate = appointmentCancelledEmail(
        appointment.patient.name, appointment.doctor.name, dateStr, cancellationReason
      );
      await sendEmail({ to: appointment.patient.email, ...emailTemplate });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment (Patient cancels their own)
// @route   PUT /api/appointments/:id/cancel
// @access  Patient
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${appointment.status} appointment` });
    }

    appointment.status = 'cancelled';
    appointment.cancelledBy = 'patient';
    appointment.cancellationReason = reason || '';
    await appointment.save();

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};
