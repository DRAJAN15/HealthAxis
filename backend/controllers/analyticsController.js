const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const MedicalRecord = require('../models/MedicalRecord');

// @desc    Admin analytics dashboard
// @route   GET /api/analytics/dashboard
// @access  Admin
exports.getDashboard = async (req, res, next) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      appointmentsByStatus,
      monthlyRevenue,
      doctorWorkload,
      recentAppointments,
      appointmentTrend,
    ] = await Promise.all([
      // 1. Total patients
      User.countDocuments({ role: 'patient', isActive: true }),

      // 2. Total doctors
      User.countDocuments({ role: 'doctor', isActive: true }),

      // 3. Total appointments
      Appointment.countDocuments(),

      // 4. Appointments by status
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),

      // 5. Monthly revenue (last 12 months)
      Payment.aggregate([
        { $match: { status: 'paid' } },
        {
          $group: {
            _id: {
              year:  { $year: '$paidAt' },
              month: { $month: '$paidAt' },
            },
            revenue: { $sum: '$amount' },
            count:   { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
        {
          $project: {
            _id: 0,
            year:    '$_id.year',
            month:   '$_id.month',
            revenue: 1,
            count:   1,
          },
        },
      ]),

      // 6. Doctor workload (appointments per doctor)
      Appointment.aggregate([
        { $match: { status: { $nin: ['cancelled', 'rejected'] } } },
        { $group: { _id: '$doctor', totalAppointments: { $sum: 1 } } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'doctor',
          },
        },
        { $unwind: '$doctor' },
        {
          $project: {
            doctorName: '$doctor.name',
            totalAppointments: 1,
            _id: 0,
          },
        },
        { $sort: { totalAppointments: -1 } },
        { $limit: 10 },
      ]),

      // 7. Recent appointments
      Appointment.find()
        .populate('patient', 'name')
        .populate('doctor', 'name')
        .sort({ createdAt: -1 })
        .limit(5),

      // 8. Appointment trend (last 7 days)
      Appointment.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    // Total revenue
    const totalRevenuaResult = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = totalRevenuaResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          totalRevenue,
        },
        appointmentsByStatus,
        monthlyRevenue,
        doctorWorkload,
        recentAppointments,
        appointmentTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Doctor dashboard analytics
// @route   GET /api/analytics/doctor
// @access  Doctor
exports.getDoctorAnalytics = async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    const [
      totalPatients,
      appointmentsByStatus,
      monthlyAppointments,
      recentPatients,
      todayAppointments,
      totalRevenue,
    ] = await Promise.all([
      Appointment.distinct('patient', { doctor: doctorId }),

      Appointment.aggregate([
        { $match: { doctor: doctorId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),

      Appointment.aggregate([
        { $match: { doctor: doctorId } },
        {
          $group: {
            _id: {
              year:  { $year: '$appointmentDate' },
              month: { $month: '$appointmentDate' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 },
        { $project: { year: '$_id.year', month: '$_id.month', count: 1, _id: 0 } },
      ]),

      Appointment.find({ doctor: doctorId, status: 'completed' })
        .populate('patient', 'name email')
        .sort({ updatedAt: -1 })
        .limit(5),

      Appointment.find({
        doctor: doctorId,
        appointmentDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt:  new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: { $nin: ['cancelled', 'rejected'] },
      }).populate('patient', 'name email phone'),

      Payment.aggregate([
        { $match: { doctor: doctorId, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients: totalPatients.length,
        appointmentsByStatus,
        monthlyAppointments,
        recentPatients,
        todayAppointments,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Patient dashboard analytics
// @route   GET /api/analytics/patient
// @access  Patient
exports.getPatientAnalytics = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const [
      appointmentsByStatus,
      upcomingAppointments,
      totalSpent,
      recentRecords,
    ] = await Promise.all([
      Appointment.aggregate([
        { $match: { patient: patientId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),

      Appointment.find({
        patient: patientId,
        appointmentDate: { $gte: new Date() },
        status: { $in: ['pending', 'confirmed'] },
      })
        .populate('doctor', 'name email')
        .sort({ appointmentDate: 1 })
        .limit(5),

      Payment.aggregate([
        { $match: { patient: patientId, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      MedicalRecord.find({ patient: patientId })
        .populate('doctor', 'name')
        .sort({ createdAt: -1 })
        .limit(3),
    ]);

    res.status(200).json({
      success: true,
      data: {
        appointmentsByStatus,
        upcomingAppointments,
        totalSpent: totalSpent[0]?.total || 0,
        recentRecords,
      },
    });
  } catch (error) {
    next(error);
  }
};
