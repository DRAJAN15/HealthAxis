const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Patient
exports.createOrder = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate("doctor", "name")
      .populate("patient", "name email");

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    if (appointment.patient._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (appointment.isPaid) {
      return res
        .status(400)
        .json({ success: false, message: "Appointment already paid" });
    }

    // Amount in paise (INR × 100)
    const amountInPaise = Math.round(appointment.consultationFee * 100);
    // Razorpay receipt must be short; keep it deterministic and <= 40 chars.
    const receipt = `rcpt_${appointmentId.slice(-8)}_${Date.now().toString().slice(-8)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        appointmentId: appointmentId.toString(),
        patientId: req.user._id.toString(),
        doctorName: appointment.doctor.name,
      },
    });

    // Save payment record (status: created)
    const payment = await Payment.create({
      appointment: appointmentId,
      patient: req.user._id,
      doctor: appointment.doctor._id,
      amount: appointment.consultationFee,
      currency: "INR",
      razorpayOrderId: order.id,
      receipt,
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt,
        paymentId: payment._id,
        keyId: process.env.RAZORPAY_KEY_ID,
        prefill: {
          name: appointment.patient.name,
          email: appointment.patient.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Patient
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    // Fetch payment details from Razorpay
    const rpPayment = await razorpay.payments.fetch(razorpayPaymentId);

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: "paid",
        paymentMethod: rpPayment.method,
        paidAt: new Date(),
      },
      { new: true },
    );

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found" });
    }

    // Mark appointment as paid
    await Appointment.findByIdAndUpdate(payment.appointment, {
      isPaid: true,
      payment: payment._id,
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Payment verified successfully",
        data: payment,
      });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history
// @route   GET /api/payments
// @access  Patient (own), Admin
exports.getPayments = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === "patient") filter.patient = req.user._id;
    else if (req.user.role === "doctor") filter.doctor = req.user._id;

    const payments = await Payment.find(filter)
      .populate("appointment", "appointmentDate timeSlot reason")
      .populate("patient", "name email")
      .populate("doctor", "name")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("appointment")
      .populate("patient", "name email")
      .populate("doctor", "name");

    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};
