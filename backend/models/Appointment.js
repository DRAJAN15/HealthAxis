const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      startTime: { type: String, required: true }, // e.g. "10:00"
      endTime:   { type: String, required: true }, // e.g. "10:30"
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
    },
    type: {
      type: String,
      enum: ['in-person', 'video', 'phone'],
      default: 'in-person',
    },
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required'],
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    notes: {
      type: String,
      default: '',
    },
    // Doctor notes after appointment
    doctorNotes: {
      type: String,
      default: '',
    },
    consultationFee: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    reminderSent: {
      email: { type: Boolean, default: false },
      sms:   { type: Boolean, default: false },
    },
    cancelledBy:     { type: String, enum: ['patient', 'doctor', 'admin', ''] },
    cancellationReason: { type: String, default: '' },
  },
  { timestamps: true }
);

// Compound index to prevent double booking
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, 'timeSlot.startTime': 1 },
  { unique: true, partialFilterExpression: { status: { $nin: ['cancelled', 'rejected'] } } }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
