const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  medicine:  { type: String, required: true },
  dosage:    { type: String, required: true },
  frequency: { type: String, required: true },
  duration:  { type: String, required: true },
  notes:     { type: String, default: '' },
});

const medicalRecordSchema = new mongoose.Schema(
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
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
    },
    symptoms: [{ type: String }],
    prescriptions: [prescriptionSchema],
    labTests: [
      {
        testName:   { type: String },
        result:     { type: String },
        normalRange:{ type: String },
        date:       { type: Date },
      }
    ],
    vitals: {
      bloodPressure:    { type: String, default: '' },
      heartRate:        { type: Number },
      temperature:      { type: Number },
      weight:           { type: Number },
      height:           { type: Number },
      oxygenSaturation: { type: Number },
    },
    notes: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: Date,
    },
    attachments: [
      {
        fileName: { type: String },
        fileUrl:  { type: String },
        fileType: { type: String },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
